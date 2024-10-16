import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class SectionsService {
  constructor(private readonly prisma: PrismaService) {}

  async getContent(courseId: string, sectionId: string) {
    try {
      // get section data
      const sectionData = await this.prisma.courseSection.findUnique({
        where: {
          id: sectionId,
          courseId,
        },
        include: {
          video: true,
          comments: true,
          links: true,
        },
      });
      if (!sectionData) throw new NotFoundException('Course section not found');

      return sectionData;
    } catch (error) {
      throw error;
    }
  }
}
