import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminUserRole } from '@prisma/client';
import { UserStatus } from '@prisma/client';

@ApiTags('Users')
@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(AdminUserRole.SUPER_ADMIN, AdminUserRole.OPERATIONS_ADMIN)
  @ApiOperation({ summary: 'Get all users' })
  async findAll(@Query() query: any) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @Roles(AdminUserRole.SUPER_ADMIN, AdminUserRole.OPERATIONS_ADMIN)
  @ApiOperation({ summary: 'Get user by ID' })
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id/status')
  @Roles(AdminUserRole.SUPER_ADMIN, AdminUserRole.OPERATIONS_ADMIN)
  @ApiOperation({ summary: 'Update user status' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: UserStatus,
    @Body('reason') reason?: string,
  ) {
    return this.usersService.updateStatus(id, status, reason);
  }

  @Post(':id/block')
  @Roles(AdminUserRole.SUPER_ADMIN, AdminUserRole.OPERATIONS_ADMIN)
  @ApiOperation({ summary: 'Block user' })
  async block(@Param('id') id: string, @Body('reason') reason: string) {
    return this.usersService.block(id, reason);
  }

  @Post(':id/unblock')
  @Roles(AdminUserRole.SUPER_ADMIN, AdminUserRole.OPERATIONS_ADMIN)
  @ApiOperation({ summary: 'Unblock user' })
  async unblock(@Param('id') id: string) {
    return this.usersService.unblock(id);
  }

  @Post(':id/suspend')
  @Roles(AdminUserRole.SUPER_ADMIN, AdminUserRole.OPERATIONS_ADMIN)
  @ApiOperation({ summary: 'Suspend user' })
  async suspend(@Param('id') id: string, @Body('reason') reason: string) {
    return this.usersService.suspend(id, reason);
  }
}
