import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ActivateUserDto, CreateUserDto } from 'src/users/dto/users.dto';
import * as bcrypt from 'bcrypt';
import { ActivationTokenPayload } from './interfaces/auth.interface';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async signActivationToken(user: CreateUserDto) {
    //create activation code
    const activationCode = this.createActivationCode();

    // hash password
    user.password = await this.hashPassword(user.password);

    // JWT payload
    const payload: ActivationTokenPayload = { user, activationCode };

    // sign JWT token
    const token = await this.jwtService.signAsync(payload, {
      secret: process.env.ACTIVATION_TOKEN_SECRET,
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

  async comparePassword(plainPassword: string, hashedPassword: string) {
    const isCorrect = await bcrypt.compare(plainPassword, hashedPassword);
    return isCorrect;
  }

  async verifyActivation({
    activationCode: givenActivationCode,
    activationToken,
  }: ActivateUserDto) {
    // verify token
    const { user, activationCode } = (await this.jwtService.verifyAsync(
      activationToken,
      { secret: process.env.ACTIVATION_TOKEN_SECRET },
    )) as ActivationTokenPayload;

    // check if the given activation code is correct
    if (activationCode !== givenActivationCode) {
      throw new BadRequestException();
    }

    return user;
  }

  async signAccessToken(id: string) {
    // JWT payload
    const payload = { id };

    // sign JWT token
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.ACCESS_TOKEN_SECRET,
      expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRE),
    });

    return accessToken;
  }
  async signRefreshToken(id: string) {
    // JWT payload
    const payload = { id };

    // sign JWT token
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.REFRESH_TOKEN_SECRET,
      expiresIn: Number(process.env.REFRESH_TOKEN_EXPIRE),
    });

    return refreshToken;
  }
}
