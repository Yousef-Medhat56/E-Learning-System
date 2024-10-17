import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthRequest } from '../interfaces/auth.interface';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class CourseGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  private getCourseId(url: string) {
    // split the url
    const requestUrlSplit = url.split('/');
    const courseIdIndex = requestUrlSplit.indexOf('courses') + 1;
    const courseId = requestUrlSplit[courseIdIndex];
    return courseId;
  }

  async isCoursePurchased(userId: string, courseId: string) {
    // user data
    const userData = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        orders: {
          select: {
            courseId: true,
          },
        },
      },
    });
    // purchased courses list
    const purchasedCourses: string[] = [];

    userData.orders.map((order) => {
      return purchasedCourses.push(order.courseId);
    });

    return purchasedCourses.includes(courseId);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest() as AuthRequest;

    // get user id
    const { id: userId } = request.user;

    // get course id
    const courseId = this.getCourseId(request.url);

    // check if the user purchased the course
    if (this.isCoursePurchased(userId, courseId)) {
      request['courseId'] = courseId;
      return true;
    }
    throw new UnauthorizedException(
      'Purchase the course to access this content',
    );
  }
}
