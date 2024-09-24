import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { UploadApiOptions } from 'cloudinary';

export class UploadMediaDto {
  @IsNotEmpty()
  @IsString()
  plainMedia: string;

  @IsOptional()
  @IsString()
  publicId?: string;

  @IsOptional()
  options?: UploadApiOptions;
}
