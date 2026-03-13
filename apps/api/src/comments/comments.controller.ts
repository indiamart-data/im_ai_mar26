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
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@ApiTags('Comments')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('requests/:requestId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  /**
   * POST /requests/:requestId/comments
   * Any user with access to the request can comment.
   * Only agents/admins can set isResolution = true.
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
  @ApiOperation({ summary: 'Add a comment to a request' })
  @ApiResponse({ status: 201, description: 'Comment added' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Request not found' })
  addComment(
    @Param('requestId') requestId: string,
    @Body() dto: CreateCommentDto,
    @CurrentUser()
    user: { sub: string; email: string; role: string; name: string },
  ) {
    return this.commentsService.addComment(requestId, dto, user);
  }

  /**
   * GET /requests/:requestId/comments
   * Employees can only see comments on their own requests.
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
  @ApiOperation({ summary: 'Get comments on a request' })
  @ApiResponse({ status: 200, description: 'List of comments' })
  @ApiResponse({ status: 404, description: 'Request not found' })
  getComments(
    @Param('requestId') requestId: string,
    @CurrentUser()
    user: { sub: string; email: string; role: string; name: string },
  ) {
    return this.commentsService.getComments(requestId, user);
  }
}
