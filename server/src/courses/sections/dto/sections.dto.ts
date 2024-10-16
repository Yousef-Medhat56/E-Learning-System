import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class addCommentDto {
  @ApiProperty()
  @IsNotEmpty()
  text: string;
  @ApiProperty()
  @IsOptional()
  parentId?: string;
}
