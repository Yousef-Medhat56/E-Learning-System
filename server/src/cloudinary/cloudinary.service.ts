import { BadRequestException, Injectable } from '@nestjs/common';
import { UploadUserAvatarDto } from './dto/cloudinary.dto';
import { v2 } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  async uploadUserAvatar(uploadAvatarDto: UploadUserAvatarDto) {
    try {
      const { publicId, avatar } = uploadAvatarDto;

      // delete the old avatar
      if (publicId) {
        await v2.uploader.destroy(publicId);
      }

      // upload the new avatar
      const cloudinaryResponse = await v2.uploader.upload(avatar, {
        folder: 'avatars',
        width: 300,
      });

      return {
        publicId: cloudinaryResponse.public_id,
        url: cloudinaryResponse.url,
      };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
