import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UploadUserAvatarDto {
  @IsNotEmpty()
  @IsString()
  avatar: string;

  @IsOptional()
  @IsString()
  publicId: string;
}
