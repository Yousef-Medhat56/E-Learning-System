import { ApiProperty } from '@nestjs/swagger';
import { Level } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  ValidateNested,
} from 'class-validator';

export class LinkDto {
  @ApiProperty()
  @IsNotEmpty()
  text: string;

  @ApiProperty()
  @IsNotEmpty()
  url: string;
}

export class VideoDto {
  @ApiProperty()
  @IsNotEmpty()
  url: string;

  @ApiProperty()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsNotEmpty()
  player: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  duration?: number;

  @ApiProperty()
  @IsNotEmpty()
  thumbnail: string;
}

export class CourseSectionDto {
  @ApiProperty()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsOptional()
  suggestion?: string;

  @ApiProperty({ type: LinkDto })
  @IsArray()
  @Type(() => LinkDto)
  @ValidateNested()
  links: LinkDto[];

  @ApiProperty({ type: VideoDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => VideoDto)
  video?: VideoDto;
}

export class CourseBenefitDto {
  @ApiProperty()
  @IsNotEmpty()
  text: string;
}

export class CoursePrerequisiteDto {
  @ApiProperty()
  @IsNotEmpty()
  text: string;
}

export class CreateOrUpdateCourseDto {
  @ApiProperty()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  price: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  estimatedPrice?: number;

  @ApiProperty()
  @IsOptional()
  demoUrl?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsIn(['Beginner', 'Intermediate', 'Advanced'])
  level: Level;

  @ApiProperty()
  thumbnail: string;

  @ApiProperty({ type: CourseSectionDto })
  @IsArray()
  @ArrayMinSize(1)
  @Type(() => CourseSectionDto)
  @ValidateNested()
  sections: CourseSectionDto[];

  @ApiProperty({ type: CourseBenefitDto })
  @IsArray()
  @ValidateNested()
  @Type(() => CourseBenefitDto)
  benefits: CourseBenefitDto[];

  @ApiProperty({ type: CoursePrerequisiteDto })
  @IsArray()
  @ValidateNested()
  @Type(() => CoursePrerequisiteDto)
  prerequisites: CoursePrerequisiteDto[];

  //TODO: ADD TAGS
}
