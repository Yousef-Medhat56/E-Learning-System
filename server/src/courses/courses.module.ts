import { Module } from '@nestjs/common';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from 'src/auth/auth.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { SectionsService } from './sections/sections.service';
import { EmailService } from 'src/email/email.service';
import { NotificationsService } from 'src/notifications/notifications.service';

@Module({
  controllers: [CoursesController],
  providers: [
    JwtService,
    AuthService,
    CoursesService,
    CloudinaryService,
    SectionsService,
    EmailService,
    NotificationsService,
  ],
})
export class CoursesModule {}
