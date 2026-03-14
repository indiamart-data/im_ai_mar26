import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { RequestPriority, RequestStatus } from '@prisma/client';

export class UpdateRequestDto {
  @ApiPropertyOptional({ enum: RequestStatus, description: 'New status' })
  @IsOptional()
  @IsEnum(RequestStatus)
  status?: RequestStatus;

  @ApiPropertyOptional({ enum: RequestPriority, description: 'New priority' })
  @IsOptional()
  @IsEnum(RequestPriority)
  priority?: RequestPriority;

  @ApiPropertyOptional({
    description: 'Assignee user id (admin/agent use only)',
  })
  @IsOptional()
  @IsString()
  assigneeId?: string;

  @ApiPropertyOptional({
    description: 'Notes about the status change',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
