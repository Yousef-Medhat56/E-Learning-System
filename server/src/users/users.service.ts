import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  ActivateUserDto,
  AvatarDto,
  CreateUserDto,
  LoginUserDto,
  SocialSignupUserDto,
  UpdatePasswordDto,
  UpdateUserInfoDto,
} from './dto/users.dto';
import { AuthService } from 'src/auth/auth.service';
import { PrismaService } from 'nestjs-prisma';
import { EmailService } from 'src/email/email.service';
import { UpstashRedisService } from 'nestjs-upstash-redis';
import { User } from '@prisma/client';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class UsersService {
  // omit user password
  private prisma: PrismaService = new PrismaService({
    prismaOptions: {
      omit: {
        user: {
          password: true,
        },
        userAvatar: {
          id: true,
        },
      },
    },
  });

  constructor(
    private authService: AuthService,
    private emailService: EmailService,
    private redisService: UpstashRedisService,
    private cloudinaryService: CloudinaryService,
  ) {}

  async signup(user: CreateUserDto) {
    try {
      // check if the user already exists
      const existedUser = await this.prisma.user.findUnique({
        where: { email: user.email },
      });

      if (existedUser) {
        throw new ConflictException('User already exists');
      }
    } catch (error) {
      throw error;
    }

    try {
      // create activation token and code
      const { token, activationCode } =
        await this.authService.signActivationToken(user);

      // send activation email
      await this.emailService.sendEmail({
        emailTo: user.email,
        subject: 'E-Learning | Activate your account',
        template: 'activation-email.ejs',
        data: { user, activationCode },
      });

      return {
        message: 'Activation email sent successfully',
        activationCode: activationCode,
        activationToken: token,
      };
    } catch (error) {
      throw new BadRequestException();
    }
  }

  async activate(activateUserDto: ActivateUserDto) {
    try {
      // get the user data from the activation token
      const user = await this.authService.verifyActivation(activateUserDto);
      //create new user
      const createdUser = await this.prisma.user.create({
        data: user,
      });
      return createdUser;
    } catch (error) {
      //check if the error reason that user already exists
      if (error.code === 'P2002') {
        throw new ConflictException('User already exists');
      }
      throw new BadRequestException();
    }
  }

  async login(loginUserDto: LoginUserDto) {
    try {
      const { email, password } = loginUserDto;
      const user = await this.prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          password: true, // select the password
          name: true,
          email: true,
          role: true,
          isVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (user) {
        //check if the password is correct
        const isCorrectPass = await this.authService.comparePassword(
          password,
          user.password,
        );
        if (isCorrectPass) {
          // create tokens
          const accessToken = await this.authService.signAccessToken({
            id: user.id,
            role: user.role,
          });
          const refreshToken = await this.authService.signRefreshToken({
            id: user.id,
            role: user.role,
          });

          // delete password from the user object
          delete user.password;

          // store user in cache
          this.redisService.set(user.id, JSON.stringify(user));
          return { accessToken, refreshToken, user };
        } else {
          throw new BadRequestException('Incorrect email or password');
        }
      } else {
        throw new NotFoundException('User does not exist');
      }
    } catch (error) {
      throw error;
    }
  }

  async refresh(oldRefreshToken: string) {
    try {
      // check that the refresh token exists
      if (oldRefreshToken) {
        // get the userId and the new tokens
        const { userId, ...tokens } =
          await this.authService.updateTokens(oldRefreshToken);

        // get the user data from cache
        const user = await this.redisService.get(userId);
        if (user) return tokens;
      }
      throw new ForbiddenException();
    } catch (error) {
      throw new ForbiddenException();
    }
  }

  async getUserById(id: string) {
    try {
      const user = await this.prisma.user.findFirstOrThrow({
        where: { id },
        include: { avatar: true },
      });
      return user;
    } catch (error) {
      throw new NotFoundException("User doesn't exist");
    }
  }

  async socialSignup(createUserDto: SocialSignupUserDto) {
    try {
      const { name, email } = createUserDto;

      //create the new user
      const createdUser = await this.prisma.user.create({
        data: { name, email },
      });

      // create tokens
      const accessToken = await this.authService.signAccessToken({
        id: createdUser.id,
        role: createdUser.role,
      });
      const refreshToken = await this.authService.signRefreshToken({
        id: createdUser.id,
        role: createdUser.role,
      });

      return { user: createdUser, accessToken, refreshToken };
    } catch (error) {
      //check if the error reason that user already exists
      if (error.code === 'P2002') {
        throw new ConflictException('User already exists');
      }
      throw new BadRequestException();
    }
  }

  async updateInfo(id: string, updateUserInfoDto: UpdateUserInfoDto) {
    const { email, name } = updateUserInfoDto;
    try {
      // Create an empty object to store update data
      const updateData: Partial<User> = {};

      if (email) {
        updateData.email = email;
      }

      if (name) {
        updateData.name = name;
      }
      //check if the updateData is empty
      if (Object.keys(updateData).length == 0) {
        throw new BadRequestException();
      }

      // update the user
      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: updateData,
      });

      // update user data in cache
      await this.redisService.set(id, JSON.stringify(updatedUser));
      return updatedUser;
    } catch (error) {
      //check if the error reason that email already exists
      if (error.code === 'P2002') {
        throw new ConflictException('Email already exists');
      }
      throw new BadRequestException();
    }
  }

  async updatePassword(id: string, updatePasswordDto: UpdatePasswordDto) {
    const { oldPassword, newPassword } = updatePasswordDto;
    try {
      // get the user old password
      const user = await this.prisma.user.findUnique({
        where: { id },
        select: { password: true },
      });

      // check that the given password is correct
      const isCorrectPass = await this.authService.comparePassword(
        oldPassword,
        user.password,
      );
      if (!isCorrectPass) throw new BadRequestException();

      //hash the new password
      const newPassHashed = await this.authService.hashPassword(newPassword);

      // update the password
      await this.prisma.user.update({
        where: { id },
        data: { password: newPassHashed },
      });

      return { message: 'Password updated successfully' };
    } catch (error) {
      throw new BadRequestException();
    }
  }

  async updateAvatar(id: string, avatarDto: AvatarDto) {
    try {
      // get the old avatar
      const { avatar } = await this.prisma.user.findUnique({
        where: { id },
        include: {
          avatar: true,
        },
      });

      // upload new avatar to cloudinary
      const { publicId, url } = await this.cloudinaryService.uploadMedia({
        publicId: avatar ? avatar.public_id : undefined,
        plainMedia: avatarDto.avatar,
        options: {
          folder: 'avatars',
          width: 300,
        },
      });

      // update the user avatar
      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: {
          avatar: {
            upsert: {
              create: {
                url,
                public_id: publicId,
              },
              update: {
                url,
                public_id: publicId,
              },
            },
          },
        },
        include: {
          avatar: true,
        },
      });

      return updatedUser;
    } catch (error) {
      throw new BadRequestException();
    }
  }

  async findAllForAdmin() {
    try {
      const users = await this.prisma.user.findMany();
      return { users };
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}
