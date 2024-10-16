import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrUpdateCourseDto } from './dto/courses.dto';
import { UpstashRedisService } from 'nestjs-upstash-redis';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class CoursesService {
  constructor(
    private readonly redisService: UpstashRedisService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly prisma: PrismaService,
  ) {
    this.prisma = new PrismaService({
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
  }
  private async uploadThumbnail(
    thumbnail: string | undefined,
    existingThumbnail?: { public_id: string },
  ) {
    if (!thumbnail) {
      throw new BadRequestException('Thumbnail is required');
    }

    const { publicId, url } = await this.cloudinaryService.uploadMedia({
      publicId: existingThumbnail?.public_id,
      plainMedia: thumbnail,
      options: { folder: 'courses' },
    });

    return { public_id: publicId, url };
  }

  private mapSections(sections: any[]) {
    return sections.map((section) => ({
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
    }));
  }

  private mapBenefitsOrPrerequisites(items: any[]) {
    return items.map((item) => ({ text: item.text }));
  }

  private async cacheCourse(courseId: string, courseData: any) {
    await this.redisService.set(courseId, JSON.stringify(courseData));
    await this.redisService.del('allCourses');
  }
  private courseIncludeOptions() {
    return {
      sections: {
        include: {
          video: { omit: { url: true } },
        },
        omit: { suggestion: true },
      },
      reviews: true,
      tags: true,
      benefits: true,
      thumbnail: true,
      prerequisites: true,
    };
  }
  async create(createCourseDto: CreateOrUpdateCourseDto) {
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
      // Check if course already exists
      const courseExists = await this.prisma.course.findUnique({
        where: { title },
      });
      if (courseExists) throw new ConflictException('Course already exists');

      // Upload thumbnail
      const thumbnailData = await this.uploadThumbnail(thumbnail);

      const newCourse = await this.prisma.course.create({
        data: {
          title,
          description,
          price,
          estimatedPrice,
          demoUrl,
          level,
          thumbnail: { create: thumbnailData },
          sections: { create: this.mapSections(sections) },
          benefits: { create: this.mapBenefitsOrPrerequisites(benefits) },
          prerequisites: {
            create: this.mapBenefitsOrPrerequisites(prerequisites),
          },
        },
        include: this.courseIncludeOptions(),
      });

      await this.cacheCourse(newCourse.id, newCourse);
      return newCourse;
    } catch (error) {
      throw error instanceof ConflictException
        ? error
        : new BadRequestException();
    }
  }

  async update(id: string, updateCourseDto: CreateOrUpdateCourseDto) {
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
    } = updateCourseDto;

    try {
      const courseData = await this.prisma.course.findUnique({
        where: { id },
        include: { thumbnail: true },
      });
      if (!courseData) throw new NotFoundException('Course not found');

      const thumbnailData = courseData.thumbnail;
      if (thumbnail) {
        const { url, public_id } = await this.uploadThumbnail(
          thumbnail,
          courseData.thumbnail,
        );
        thumbnailData.url = url;
        thumbnailData.public_id = public_id;
      }

      const updatedCourse = await this.prisma.course.update({
        where: { id },
        data: {
          title: title || courseData.title,
          description: description || courseData.description,
          price: price ?? courseData.price,
          estimatedPrice: estimatedPrice !== undefined ? estimatedPrice : null,
          demoUrl: demoUrl || courseData.demoUrl,
          level: level || courseData.level,
          thumbnail: {
            update: {
              public_id: thumbnailData.public_id,
              url: thumbnailData.url,
            },
          },
          sections: sections
            ? { deleteMany: {}, create: this.mapSections(sections) }
            : undefined,
          benefits: benefits
            ? {
                deleteMany: {},
                create: this.mapBenefitsOrPrerequisites(benefits),
              }
            : undefined,
          prerequisites: prerequisites
            ? {
                deleteMany: {},
                create: this.mapBenefitsOrPrerequisites(prerequisites),
              }
            : undefined,
        },
        include: this.courseIncludeOptions(),
      });

      await this.cacheCourse(id, updatedCourse);
      return updatedCourse;
    } catch (error) {
      throw error instanceof NotFoundException
        ? error
        : new BadRequestException();
    }
  }

  // get single course --without purchasing
  async findOne(id: string) {
    try {
      const cachedCourse = await this.redisService.get(id);
      if (cachedCourse) return cachedCourse;

      const course = await this.prisma.course.findUnique({
        where: { id },
        include: this.courseIncludeOptions(),
      });

      await this.cacheCourse(id, course);
      return course;
    } catch (error) {
      throw new NotFoundException('Course not found');
    }
  }

  // get all courses --without purchasing
  async findAll() {
    try {
      const cachedCourses = await this.redisService.get('allCourses');
      if (cachedCourses) return cachedCourses;

      const courses = await this.prisma.course.findMany({
        include: this.courseIncludeOptions(),
      });

      await this.redisService.set('allCourses', JSON.stringify(courses));
      return courses;
    } catch (error) {
      throw new BadRequestException('Could not fetch courses');
    }
  }

  // access section content --purshasing required
  async getSectionContent(courseId: string, sectionId: string) {
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
