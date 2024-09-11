import { Role } from '@prisma/client';
import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  Length,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @Length(6)
  password: string;

  @IsOptional()
  @IsIn(['USER', 'ADMIN'])
  role?: Role;

  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;
}
