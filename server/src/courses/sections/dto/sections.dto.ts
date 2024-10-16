import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class addCommentDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  text: string;
  @ApiProperty({ required: false })
  @IsOptional()
  parentId?: string;
}
