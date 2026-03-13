import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
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
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { FilterRequestsDto } from './dto/filter-requests.dto';

@ApiTags('Requests')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  /**
   * POST /requests
   * Any authenticated employee (or above) can create a request.
   */
  @Post()
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
  @ApiOperation({ summary: 'Create a new service request' })
  @ApiResponse({ status: 201, description: 'Request created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(
    @Body() dto: CreateRequestDto,
    @CurrentUser()
    user: { sub: string; email: string; role: string; name: string },
  ) {
    return this.requestsService.create(dto, user);
  }

  /**
   * GET /requests
   * Filtered based on role:
   *  - Employee → own requests only
   *  - Manager  → own + direct reports' requests
   *  - Agents / Admins → all requests
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
  @ApiOperation({ summary: 'List service requests (RBAC filtered)' })
  @ApiResponse({ status: 200, description: 'Paginated list of requests' })
  findAll(
    @Query() filter: FilterRequestsDto,
    @CurrentUser()
    user: { sub: string; email: string; role: string; name: string },
  ) {
    return this.requestsService.findAll(filter, user);
  }

  /**
   * GET /requests/:id
   * Employees can only view their own requests.
   */
  @Get(':id')
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
  @ApiOperation({ summary: 'Get request details by id' })
  @ApiResponse({ status: 200, description: 'Request details' })
  @ApiResponse({ status: 404, description: 'Request not found' })
  findOne(
    @Param('id') id: string,
    @CurrentUser()
    user: { sub: string; email: string; role: string; name: string },
  ) {
    return this.requestsService.findOne(id, user);
  }

  /**
   * PATCH /requests/:id
   * Agents and admins can update status, priority, and assignee.
   */
  @Patch(':id')
  @Roles(
    EharsUserRole.IT_AGENT,
    EharsUserRole.FACILITIES_AGENT,
    EharsUserRole.HR_HEAD,
    EharsUserRole.IT_HEAD,
    EharsUserRole.ADMIN_HEAD,
    EharsUserRole.FINANCE_MANAGER,
    EharsUserRole.SYSTEM_ADMIN,
  )
  @ApiOperation({
    summary: 'Update request status / assignee (agents & admins)',
  })
  @ApiResponse({ status: 200, description: 'Request updated' })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiResponse({ status: 404, description: 'Request not found' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateRequestDto,
    @CurrentUser()
    user: { sub: string; email: string; role: string; name: string },
  ) {
    return this.requestsService.updateRequest(id, dto, user);
  }

  /**
   * DELETE /requests/:id
   * Employees cancel their own pending requests; agents/admins can cancel any.
   */
  @Delete(':id')
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
  @ApiOperation({ summary: 'Cancel a request' })
  @ApiResponse({ status: 200, description: 'Request cancelled' })
  @ApiResponse({ status: 400, description: 'Cannot cancel in current status' })
  cancel(
    @Param('id') id: string,
    @CurrentUser()
    user: { sub: string; email: string; role: string; name: string },
  ) {
    return this.requestsService.cancel(id, user);
  }
}
