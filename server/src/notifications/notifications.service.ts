import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import {
  CourseNotificationDto,
  CreateNotificationDto,
} from './dto/notifications.dto';

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

  // set notification status to seen
  async updateStatus(id: string) {
    try {
      // check if notification exists
      const isNotificationExists = await this.prisma.notification.findUnique({
        where: { id },
        select: { id: true },
      });
      if (!isNotificationExists) {
        throw new NotFoundException('Notification not found');
      }

      // update notification status
      await this.prisma.notification.update({
        where: {
          id,
        },
        data: {
          status: 'Seen',
        },
      });

      // return all notifications
      return this.getAll();
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException();
    }
  }

  async create({ userId, title, message }: CreateNotificationDto) {
    try {
      await this.prisma.notification.create({
        data: {
          userId,
          title,
          message,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  // send new order notification
  async newOrder({ userId, courseName }: CourseNotificationDto) {
    try {
      await this.create({
        userId,
        title: `New Order`,
        message: `You have a new order from ${courseName}`,
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  // send new review notification
  async newReview({ userId, courseName }: CourseNotificationDto) {
    try {
      await this.create({
        userId,
        title: `New Review`,
        message: `You have a new review from ${courseName}`,
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
