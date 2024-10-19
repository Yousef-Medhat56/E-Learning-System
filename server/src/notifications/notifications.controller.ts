import { Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RoleGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Get all notifications',
  })
  @ApiBearerAuth()
  @ApiResponse({
    status: 201,
    description: 'Success',
  })
  @ApiResponse({ status: 401, description: 'Unautharized' })
  async getAll() {
    const notifications = await this.notificationsService.getAll();
    return notifications;
  }

  @Patch('update-status/:id')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Update notification status from "Delivered" to "Seen"',
  })
  @ApiBearerAuth()
  @ApiResponse({
    status: 201,
    description: 'Success',
  })
  @ApiResponse({ status: 401, description: 'Unautharized' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async updateStatus(@Param() { id }: { id: string }) {
    const notifications = await this.notificationsService.updateStatus(id);
    return notifications;
  }
}
