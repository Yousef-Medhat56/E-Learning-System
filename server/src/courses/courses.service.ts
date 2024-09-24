import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { CreateCourseDto } from './dto/courses.dto';
import { UpstashRedisService } from 'nestjs-upstash-redis';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class CoursesService {
  private prisma: PrismaService = new PrismaService({
    prismaOptions: {
      omit: {
        courseBenefit: {
          id: true,
          courseId: true,
        },
        coursePrerequisite: {
          id: true,
          courseId: true,
        },
        link: { id: true, courseSectionId: true },
      },
    },
  });

  constructor(
    private redisService: UpstashRedisService,
    private cloudinaryService: CloudinaryService,
  ) {}

  async create(createCourseDto: CreateCourseDto) {
    const {
      title,
      description,
      price,
      estimatedPrice,
      demoUrl,
      level,
      thumbnail,
      sections,
      benefits,
      prerequisites,
    } = createCourseDto;

    try {
      //check if the course exists already
      const isCourseExist = await this.prisma.course.findUnique({
        where: { title },
      });
      if (isCourseExist) throw new ConflictException({ code: 'P2002' });

      // upload course thumbnail to cloudinary
      const { publicId, url } = await this.cloudinaryService.uploadMedia({
        publicId: undefined,
        plainMedia: thumbnail,
        options: {
          folder: 'courses',
        },
      });

      const newCourse = await this.prisma.course.create({
        data: {
          title: title,
          description: description,
          price: price,
          estimatedPrice: estimatedPrice,
          demoUrl: demoUrl,
          level: level,
          thumbnail: {
            create: {
              url: url,
              public_id: publicId,
            },
          },
          sections: {
            create: sections.map((section: any) => ({
              title: section.title,
              description: section.description,
              suggestion: section.suggestion,
              links: {
                create: section.links.map((link: any) => ({
                  text: link.text,
                  url: link.url,
                })),
              },
              video: section.video
                ? {
                    create: {
                      url: section.video.url,
                      description: section.video.description,
                      player: section.video.player,
                      duration: section.video.duration,
                      thumbnail: {
                        create: {
                          url: section.video.thumbnail.url,
                          public_id: section.video.thumbnail.public_id,
                        },
                      },
                    },
                  }
                : undefined,
            })),
          },
          benefits: {
            create: benefits.map((benefit: any) => ({
              text: benefit.text,
            })),
          },
          prerequisites: {
            create: prerequisites.map((prerequisite: any) => ({
              text: prerequisite.text,
            })),
          },
        },
        include: {
          sections: {
            include: {
              links: true,
              video: {
                include: {
                  thumbnail: true,
                },
              },
            },
          },
          benefits: true,
          prerequisites: true,
          thumbnail: true,
        },
      });
      // store course in cache
      this.redisService.set(newCourse.id, JSON.stringify(newCourse));
      return newCourse;
    } catch (error) {
      if (error.status === 409) {
        throw new ConflictException('Course already exists');
      }
      throw new BadRequestException();
    }
  }
}
