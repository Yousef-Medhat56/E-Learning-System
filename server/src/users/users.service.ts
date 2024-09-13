import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ActivateUserDto, CreateUserDto, LoginUserDto } from './dto/users.dto';
import { AuthService } from 'src/auth/auth.service';
import { PrismaService } from 'nestjs-prisma';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
    private emailService: EmailService,
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
      const user = await this.prisma.user.findUnique({ where: { email } });

      if (user) {
        //check if the password is correct
        const isCorrectPass = await this.authService.comparePassword(
          password,
          user.password,
        );
        if (isCorrectPass) {
          const accessToken = await this.authService.signAccessToken(user.id);
          const refreshToken = await this.authService.signRefreshToken(user.id);
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
}
