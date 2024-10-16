import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RoleGuard } from 'src/auth/guards/roles.guard';
import { CoursesService } from './courses.service';
import { AddReviewDto, CreateOrUpdateCourseDto } from './dto/courses.dto';
import { ApiTags } from '@nestjs/swagger';
import { CourseGuard } from 'src/auth/guards/course.guard';
import { SectionsService } from './sections/sections.service';
import { AuthRequest } from 'src/auth/interfaces/auth.interface';
import { addCommentDto } from './sections/dto/sections.dto';
import { CourseSectionGuard } from 'src/auth/guards/courseSection.guard';

@ApiTags('Courses')
@Controller('courses')
export class CoursesController {
  constructor(
    private readonly coursesService: CoursesService,
    private readonly sectionsService: SectionsService,
  ) {}

  @Post()
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  async create(@Body() createCourseDto: CreateOrUpdateCourseDto) {
    const course = await this.coursesService.create(createCourseDto);
    return course;
  }
  @Patch(':id')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  async update(
    @Param() { id }: { id: string },
    @Body() updateCourseDto: CreateOrUpdateCourseDto,
  ) {
    const course = await this.coursesService.update(id, updateCourseDto);
    return course;
  }
  @Get(':id')
  async findOne(@Param() { id }: { id: string }) {
    const course = await this.coursesService.findOne(id);
    return course;
  }
  @Get()
  async findAll() {
    const courses = await this.coursesService.findAll();
    return courses;
  }
  @Get(':courseId/sections/:sectionId')
  @UseGuards(AuthGuard, CourseGuard, CourseSectionGuard)
  async getSection(@Param() { sectionId }: { sectionId: string }) {
    const sectionContent = await this.sectionsService.getContent(sectionId);
    return sectionContent;
  }
  @Post(':courseId/sections/:sectionId/comments')
  @UseGuards(AuthGuard, CourseGuard, CourseSectionGuard)
  async addComment(
    @Param() { sectionId }: { sectionId: string },
    @Body() comment: addCommentDto,
    @Req() req: AuthRequest,
  ) {
    const { id: userId } = req.user;
    const newComment = await this.sectionsService.addComment(
      sectionId,
      userId,
      comment,
    );
    return newComment;
  }
  @Post(':courseId/reviews')
  @UseGuards(AuthGuard, CourseGuard)
  async addReview(
    @Param() { courseId }: { courseId: string },
    @Body() review: AddReviewDto,
    @Req() req: AuthRequest,
  ) {
    const { id: userId } = req.user;
    const newReview = await this.coursesService.addReview(
      courseId,
      userId,
      review,
    );
    return newReview;
  }
}
