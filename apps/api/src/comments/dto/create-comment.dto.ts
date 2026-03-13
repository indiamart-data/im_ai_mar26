import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({ description: 'Comment content', maxLength: 2000 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  content: string;

  @ApiPropertyOptional({
    default: false,
    description: 'Mark this comment as the official resolution note',
  })
  @IsOptional()
  @IsBoolean()
  isResolution?: boolean;
}
