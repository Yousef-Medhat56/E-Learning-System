import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class CourseSectionGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  private getSectionId(url: string) {
    // split the url
    const requestUrlSplit = url.split('/');
    const sectionIdIndex = requestUrlSplit.indexOf('sections') + 1;
    const sectionId = requestUrlSplit[sectionIdIndex];
    return sectionId;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const sectionId = this.getSectionId(request.url);

    const courseSectionsIDs = await this.prisma.course.findUnique({
      where: { id: request['courseId'] },
      select: {
        sections: {
          select: {
            id: true,
          },
        },
      },
    });

    // check if the section exists in the course
    const sectionInCourse = courseSectionsIDs.sections.find(
      (section) => section.id == sectionId,
    );
    if (sectionInCourse) return true;
    throw new BadRequestException('Invalid section Id');
  }
}
