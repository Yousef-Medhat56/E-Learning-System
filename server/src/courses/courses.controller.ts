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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
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
  @ApiOperation({
    summary: 'Create a new course',
  })
  @ApiBearerAuth()
  @ApiResponse({
    status: 201,
    description: 'Course created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unautharized' })
  async create(@Body() createCourseDto: CreateOrUpdateCourseDto) {
    const course = await this.coursesService.create(createCourseDto);
    return course;
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Update course',
  })
  @ApiBearerAuth()
  @ApiResponse({
    status: 201,
    description: 'Course updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unautharized' })
  async update(
    @Param() { id }: { id: string },
    @Body() updateCourseDto: CreateOrUpdateCourseDto,
  ) {
    const course = await this.coursesService.update(id, updateCourseDto);
    return course;
  }

  @Get('admin')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Get all courses details for admins',
  })
  @ApiBearerAuth()
  @ApiResponse({
    status: 201,
    description: 'Success',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAllForAdmin() {
    const courses = await this.coursesService.findAllForAdmin();
    return courses;
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get course data without purchasing',
  })
  @ApiResponse({
    status: 201,
    description: 'Success',
  })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async findOne(@Param() { id }: { id: string }) {
    const course = await this.coursesService.findOne(id);
    return course;
  }

  @Get()
  @ApiOperation({
    summary: 'Get all courses data without purchasing',
  })
  @ApiResponse({
    status: 201,
    description: 'Success',
  })
  @ApiResponse({ status: 400, description: "Couldn't fetch courses" })
  async findAll() {
    const courses = await this.coursesService.findAll();
    return courses;
  }

  @Get(':courseId/sections/:sectionId')
  @UseGuards(AuthGuard, CourseGuard, CourseSectionGuard)
  @ApiOperation({
    summary: 'Get section content',
  })
  @ApiBearerAuth()
  @ApiResponse({
    status: 201,
    description: 'Success',
  })
  @ApiResponse({ status: 401, description: 'Unautharized' })
  @ApiResponse({ status: 404, description: 'Section not found' })
  async getSection(@Param() { sectionId }: { sectionId: string }) {
    const sectionContent = await this.sectionsService.getContent(sectionId);
    return sectionContent;
  }
  @Post(':courseId/sections/:sectionId/comments')
  @UseGuards(AuthGuard, CourseGuard, CourseSectionGuard)
  @ApiOperation({
    summary: 'Add comment to a section',
  })
  @ApiBearerAuth()
  @ApiResponse({
    status: 201,
    description: 'Success',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unautharized' })
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
  @ApiOperation({
    summary: 'Add review to the course',
  })
  @ApiBearerAuth()
  @ApiResponse({
    status: 201,
    description: 'Success',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unautharized' })
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
