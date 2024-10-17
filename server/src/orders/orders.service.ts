import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/orders.dto';
import { CourseGuard } from 'src/auth/guards/course.guard';
import { PrismaService } from 'nestjs-prisma';
import { NotificationsService } from 'src/notifications/notifications.service';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly courseGuard: CourseGuard,
    private readonly emailService: EmailService,
  ) {}
  async create(userId: string, createOrderDto: CreateOrderDto) {
    try {
      const { courseId } = createOrderDto;

      //check if the user purchased the course already
      const isPurchased = await this.courseGuard.isCoursePurchased(
        userId,
        courseId,
      );
      if (isPurchased) {
        throw new BadRequestException('You already purchased this course');
      }

      // check if course doesn't exist
      const isCourseExist = await this.prisma.course.findFirst({
        where: {
          id: courseId,
        },
      });
      if (!isCourseExist) {
        throw new NotFoundException('Course not found');
      }

      // create new order
      const newOrder = await this.prisma.order.create({
        data: {
          courseId,
          userId,
        },
        include: {
          course: {
            select: {
              title: true,
              price: true,
            },
          },
          user: {
            select: {
              email: true,
            },
          },
        },
      });

      //send confirmation email to the user
      this.emailService.sendEmail({
        emailTo: newOrder.user.email,
        template: 'order-confirmation.ejs',
        subject: 'E-Learning | Order confirmation',
        data: {
          order: {
            _id: newOrder.courseId.slice(0, 6),
            name: newOrder.course.title,
            price: newOrder.course.price,
            date: new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }),
          },
        },
      });

      // send new order notification
      this.notificationsService.newOrder({
        userId,
        courseName: newOrder.course.title,
      });

      return newOrder;
    } catch (error) {
      throw error;
    }
  }
}
