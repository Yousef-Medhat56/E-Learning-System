import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiProperty({ description: 'A valid email address' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ minLength: 6 })
  @IsNotEmpty()
  @Length(6)
  password: string;

  @ApiPropertyOptional({ enum: ['USER', 'ADMIN'] })
  @IsOptional()
  @IsIn(['USER', 'ADMIN'])
  role?: Role;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;
}
