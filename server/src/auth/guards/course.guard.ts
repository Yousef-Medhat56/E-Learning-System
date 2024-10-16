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

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest() as AuthRequest;

    // get user id
    const { id } = request.user;

    // user data
    const userData = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });

    const courseId = this.getCourseId(request.url);

    // check if the user purchased this course
    const isCoursePurchased = userData.purchasedCoursesIDs.includes(courseId);

    if (isCoursePurchased) {
      request['courseId'] = courseId;
      return true;
    }
    throw new UnauthorizedException(
      'Purchase the course to access this content',
    );
  }
}
