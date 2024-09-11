import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma/dist/prisma.service';
import { CreateUserDto } from './dto/users.dto';
import { extendCreateQuery } from './utils/extendCreateQuery.util';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {
    //@ts-expect-error Extend the "CREATE query" to hash password before creating the user
    this.prisma = extendCreateQuery();
  }

  async create(user: CreateUserDto) {
    try {
      const createdUser = await this.prisma.user.create({
        data: user,
      });
      return createdUser;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
