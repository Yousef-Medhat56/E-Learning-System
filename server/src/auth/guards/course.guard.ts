import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { AuthRequest } from '../interfaces/auth.interface';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class CourseGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  private getCourseAndSectionIds(url: string) {
    // split the url
    const requestUrlSplit = url.split('/');
    const courseIdIndex = requestUrlSplit.indexOf('courses') + 1;
    const courseId = requestUrlSplit[courseIdIndex];
    const sectionIdIndex = requestUrlSplit.indexOf('sections') + 1;
    const sectionId = requestUrlSplit[sectionIdIndex];
    return { courseId, sectionId };
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

    const { courseId, sectionId } = this.getCourseAndSectionIds(request.url);

    const courseSectionsIDs = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: {
        sections: {
          select: {
            id: true,
          },
        },
      },
    });

    // check if the user purchased this course
    const isCoursePurchased = userData.purchasedCoursesIDs.includes(courseId);

    if (isCoursePurchased) {
      //check if the section exists in the course
      const sectionInCourse = courseSectionsIDs.sections.find(
        (section) => section.id == sectionId,
      );
      if (sectionInCourse) return true;
      throw new BadRequestException('Invalid section Id');
    }
    throw new UnauthorizedException(
      'Purchase the course to access this content',
    );
  }
}
