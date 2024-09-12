import { BadRequestException, Injectable } from '@nestjs/common';
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
      const user = await this.authService.activate(activateUserDto);
      //create new user
      const createdUser = await this.prisma.user.create({
        data: user,
      });
      return createdUser;
    } catch (error) {
      throw new BadRequestException();
    }
  }
}
