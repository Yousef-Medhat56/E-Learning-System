import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { addCommentDto } from './dto/sections.dto';

@Injectable()
export class SectionsService {
  constructor(private readonly prisma: PrismaService) {}

  async getContent(sectionId: string) {
    try {
      // get section data
      const sectionData = await this.prisma.courseSection.findUnique({
        where: {
          id: sectionId,
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

  async addComment(sectionId: string, userId: string, comment: addCommentDto) {
    try {
      const { text, parentId } = comment;

      if (parentId) {
        const parentComment = await this.prisma.comment.findUnique({
          where: { id: parentId },
          select: {
            courseSectionId: true,
          },
        });
        // check if the parent comment exists or the parent comment section id doesn't equal the provided sections id
        if (!parentComment || parentComment.courseSectionId != sectionId)
          throw 'Invalid parent comment';
      }
      const newComment = await this.prisma.comment.create({
        data: {
          courseSectionId: sectionId,
          userId,
          text,
          parentId,
        },
      });
      return newComment;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
