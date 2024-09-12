import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { ActivateUserDto, CreateUserDto } from './dto/users.dto';
import { AuthService } from 'src/auth/auth.service';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
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
        await this.authService.createActivationToken(user);

      return {
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
      const user = await this.authService.activate(activateUserDto);
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
}
