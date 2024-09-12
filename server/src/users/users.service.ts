import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/users.dto';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class UsersService {
  constructor(private authService: AuthService) {}

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
}
