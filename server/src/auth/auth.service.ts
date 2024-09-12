import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/users/dto/users.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async createActivationToken(user: CreateUserDto) {
    //create activation code
    const activationCode = this.createActivationCode();

    // hash password
    user.password = await this.hashPassword(user.password);

    // JWT payload
    const payload = { user, activationCode };

    // sign JWT token
    const token = await this.jwtService.signAsync(payload, {
      secret: process.env.ACTIVATION_SECRET,
      expiresIn: '1h',
    });

    return { token, activationCode };
  }

  createActivationCode() {
    // generate random 4 digits number
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  async hashPassword(password: string) {
    const hashedPass = await bcrypt.hash(password, 10);
    return hashedPass;
  }
}
