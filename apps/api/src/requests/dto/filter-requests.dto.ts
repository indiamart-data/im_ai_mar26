import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { RequestPriority, RequestStatus, RequestType } from '@prisma/client';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class FilterRequestsDto extends PaginationDto {
  @ApiPropertyOptional({ enum: RequestStatus, description: 'Filter by status' })
  @IsOptional()
  @IsEnum(RequestStatus)
  status?: RequestStatus;

  @ApiPropertyOptional({ enum: RequestType, description: 'Filter by type' })
  @IsOptional()
  @IsEnum(RequestType)
  type?: RequestType;

  @ApiPropertyOptional({
    enum: RequestPriority,
    description: 'Filter by priority',
  })
  @IsOptional()
  @IsEnum(RequestPriority)
  priority?: RequestPriority;

  @ApiPropertyOptional({
    description: 'Filter by requester id (admin/manager only)',
  })
  @IsOptional()
  @IsString()
  requesterId?: string;

  @ApiPropertyOptional({ description: 'Filter by assignee id' })
  @IsOptional()
  @IsString()
  assigneeId?: string;

  @ApiPropertyOptional({
    description: 'Search in title and description',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
