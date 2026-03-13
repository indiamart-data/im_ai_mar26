import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApprovalDecision } from '@prisma/client';

export class ApproveRequestDto {
  @ApiProperty({
    enum: ApprovalDecision,
    description: 'Approval decision: APPROVED or REJECTED',
  })
  @IsEnum(ApprovalDecision)
  decision: ApprovalDecision;

  @ApiPropertyOptional({
    description: 'Optional comments justifying the decision',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comments?: string;
}
