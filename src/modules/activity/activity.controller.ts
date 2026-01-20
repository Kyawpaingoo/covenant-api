import { Controller, Get, Query, UseGuards, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ActivityService } from './activity.service';
import { JwtAuthGuard } from '../auth/guards';
import { CurrentUser } from '../../common/decorators';
import { EntityType } from '@prisma/client';

interface UserPayload {
  id: string;
  email: string;
}

@ApiTags('activity-logs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('activity-logs')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get()
  @ApiOperation({ summary: 'Get all activity logs for authenticated developer' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Activity logs retrieved successfully' })
  findAll(
    @CurrentUser() user: UserPayload,
    @Query('limit') limit?: string,
  ) {
    return this.activityService.findAll(user.id, limit ? parseInt(limit, 10) : 50);
  }

  @Get(':entityType/:entityId')
  @ApiOperation({ summary: 'Get activity logs for a specific entity' })
  @ApiResponse({ status: 200, description: 'Activity logs retrieved successfully' })
  findByEntity(
    @Param('entityType') entityType: EntityType,
    @Param('entityId') entityId: string,
  ) {
    return this.activityService.findByEntity(entityType, entityId);
  }
}
