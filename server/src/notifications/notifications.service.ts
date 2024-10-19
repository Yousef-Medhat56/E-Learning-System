import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { NewOrderNotfication } from './dto/notifications.dto';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  // get all notifications
  async getAll() {
    try {
      const notifications = await this.prisma.notification.findMany({
        orderBy: {
          createdAt: 'desc',
        },
      });
      return { notifications };
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  // send new order notification
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
