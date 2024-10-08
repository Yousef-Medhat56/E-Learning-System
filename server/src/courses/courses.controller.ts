import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RoleGuard } from 'src/auth/guards/roles.guard';
import { CoursesService } from './courses.service';
import { CreateOrUpdateCourseDto } from './dto/courses.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

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
}
