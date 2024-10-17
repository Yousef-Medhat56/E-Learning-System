import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { JwtService } from '@nestjs/jwt';
import { CourseGuard } from 'src/auth/guards/course.guard';
import { NotificationsService } from 'src/notifications/notifications.service';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService, JwtService, CourseGuard, NotificationsService],
})
export class OrdersModule {}
