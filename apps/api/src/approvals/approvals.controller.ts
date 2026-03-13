import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { EharsUserRole } from '@prisma/client';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApprovalsService } from './approvals.service';
import { ApproveRequestDto } from './dto/approve-request.dto';

@ApiTags('Approvals')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('requests/:requestId/approvals')
export class ApprovalsController {
  constructor(private readonly approvalsService: ApprovalsService) {}

  /**
   * POST /requests/:requestId/approvals
   * Managers and heads approve or reject a pending request.
   */
  @Post()
  @Roles(
    EharsUserRole.MANAGER,
    EharsUserRole.HR_HEAD,
    EharsUserRole.IT_HEAD,
    EharsUserRole.ADMIN_HEAD,
    EharsUserRole.FINANCE_MANAGER,
    EharsUserRole.SYSTEM_ADMIN,
  )
  @ApiOperation({ summary: 'Approve or reject a request' })
  @ApiResponse({ status: 201, description: 'Decision recorded' })
  @ApiResponse({ status: 400, description: 'Request not in PENDING state' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Request not found' })
  approve(
    @Param('requestId') requestId: string,
    @Body() dto: ApproveRequestDto,
    @CurrentUser()
    user: { sub: string; email: string; role: string; name: string },
  ) {
    return this.approvalsService.approve(requestId, dto, user);
  }

  /**
   * GET /requests/:requestId/approvals
   * Retrieve approval history for a request.
   */
  @Get()
  @Roles(
    EharsUserRole.EMPLOYEE,
    EharsUserRole.MANAGER,
    EharsUserRole.IT_AGENT,
    EharsUserRole.FACILITIES_AGENT,
    EharsUserRole.HR_HEAD,
    EharsUserRole.IT_HEAD,
    EharsUserRole.ADMIN_HEAD,
    EharsUserRole.FINANCE_MANAGER,
    EharsUserRole.SYSTEM_ADMIN,
  )
  @ApiOperation({ summary: 'Get approval history for a request' })
  @ApiResponse({ status: 200, description: 'List of approval records' })
  @ApiResponse({ status: 404, description: 'Request not found' })
  getApprovals(
    @Param('requestId') requestId: string,
    @CurrentUser()
    user: { sub: string; email: string; role: string; name: string },
  ) {
    return this.approvalsService.getApprovals(requestId, user);
  }
}
