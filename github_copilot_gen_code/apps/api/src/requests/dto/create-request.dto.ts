import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { RequestPriority, RequestType } from '@prisma/client';

export class CreateRequestDto {
  @ApiProperty({ description: 'Short descriptive title', maxLength: 200 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @ApiProperty({ description: 'Detailed description of the request' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ enum: RequestType, description: 'Category of the request' })
  @IsEnum(RequestType)
  type: RequestType;

  @ApiPropertyOptional({
    enum: RequestPriority,
    default: RequestPriority.MEDIUM,
    description: 'Priority level',
  })
  @IsOptional()
  @IsEnum(RequestPriority)
  priority?: RequestPriority;

  @ApiPropertyOptional({
    description: 'Flexible JSON metadata (asset details, location, etc.)',
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
