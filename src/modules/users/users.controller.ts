import { Controller, Get, Delete, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards';
import { CurrentUser } from '../../common/decorators';

interface UserPayload {
  id: string;
  email: string;
}

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('sessions')
  @ApiOperation({ summary: 'Get all active sessions for current user' })
  @ApiResponse({ status: 200, description: 'Sessions retrieved successfully' })
  async getSessions(@CurrentUser() user: UserPayload) {
    return this.usersService.getSessions(user.id);
  }

  @Delete('sessions/:sessionId')
  @ApiOperation({ summary: 'Delete a specific session (logout from device)' })
  @ApiResponse({ status: 200, description: 'Session deleted successfully' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async deleteSession(
    @CurrentUser() user: UserPayload,
    @Param('sessionId') sessionId: string,
  ) {
    return this.usersService.deleteSession(user.id, sessionId);
  }
}
