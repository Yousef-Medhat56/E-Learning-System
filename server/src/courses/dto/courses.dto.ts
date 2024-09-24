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

export class VideoDto {
  @IsNotEmpty()
  url: string;
  @IsNotEmpty()
  description: string;
  @IsNotEmpty()
  player: string;

  @IsOptional()
  @IsNumber()
  duration?: number;

  @IsNotEmpty()
  thumbnail: string;
}

export class CourseSectionDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  description: string;

  @IsOptional()
  suggestion?: string;

  @IsArray()
  @Type(() => LinkDto)
  @ValidateNested()
  links: LinkDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => VideoDto)
  video?: VideoDto;
}

export class CourseBenefitDto {
  @IsNotEmpty()
  text: string;
}

export class CoursePrerequisiteDto {
  @IsNotEmpty()
  text: string;
}

export class LinkDto {
  @IsNotEmpty()
  text: string;

  @IsNotEmpty()
  url: string;
}

export class CreateOrUpdateCourseDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsOptional()
  @IsNumber()
  estimatedPrice?: number;

  @IsOptional()
  demoUrl?: string;

  @IsNotEmpty()
  @IsIn(['Beginner', 'Intermediate', 'Advanced'])
  level: Level;

  @IsNotEmpty()
  thumbnail: string;

  @IsArray()
  @ArrayMinSize(1)
  @Type(() => CourseSectionDto)
  @ValidateNested()
  sections: CourseSectionDto[];

  @IsArray()
  @ValidateNested()
  @Type(() => CourseBenefitDto)
  benefits: CourseBenefitDto[];

  @IsArray()
  @ValidateNested()
  @Type(() => CourseBenefitDto)
  prerequisites: CourseBenefitDto[];

  //TODO: ADD TAGS
}
