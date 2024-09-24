import { BadRequestException, Injectable } from '@nestjs/common';
import { UploadMediaDto } from './dto/cloudinary.dto';
import { v2 } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  async uploadMedia(uploadMediaDto: UploadMediaDto) {
    try {
      const { publicId, plainMedia, options } = uploadMediaDto;

      // delete the old media if exists
      if (publicId) {
        await v2.uploader.destroy(publicId);
      }

      // upload the new media
      const cloudinaryResponse = await v2.uploader.upload(plainMedia, options);

      return {
        publicId: cloudinaryResponse.public_id,
        url: cloudinaryResponse.url,
      };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
