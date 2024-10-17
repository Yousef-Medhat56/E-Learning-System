import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { NewOrderNotfication } from './dto/notifications.dto';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}
  async newOrder({ userId, courseName }: NewOrderNotfication) {
    try {
      await this.prisma.notification.create({
        data: {
          userId,
          title: `New Order`,
          message: `You have a new order from ${courseName}`,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
