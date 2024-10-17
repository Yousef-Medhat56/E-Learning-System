import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/orders.dto';
import { CourseGuard } from 'src/auth/guards/course.guard';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly courseGuard: CourseGuard,
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
      });

      return newOrder;
    } catch (error) {
      throw error;
    }
  }
}
