import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminUserRole } from '@prisma/client';

@ApiTags('Bookings')
@Controller('admin/bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get()
  @Roles(AdminUserRole.SUPER_ADMIN, AdminUserRole.OPERATIONS_ADMIN, AdminUserRole.SUPPORT_AGENT)
  @ApiOperation({ summary: 'Get all bookings' })
  async findAll(@Query() query: any) {
    return this.bookingsService.findAll(query);
  }

  @Get('stats')
  @Roles(AdminUserRole.SUPER_ADMIN, AdminUserRole.OPERATIONS_ADMIN, AdminUserRole.SUPPORT_AGENT)
  @ApiOperation({ summary: 'Get booking statistics' })
  async getStats() {
    return this.bookingsService.getStats();
  }

  @Get(':id')
  @Roles(AdminUserRole.SUPER_ADMIN, AdminUserRole.OPERATIONS_ADMIN, AdminUserRole.SUPPORT_AGENT)
  @ApiOperation({ summary: 'Get booking by ID' })
  async findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(id);
  }

  @Post(':id/assign')
  @Roles(AdminUserRole.SUPER_ADMIN, AdminUserRole.OPERATIONS_ADMIN)
  @ApiOperation({ summary: 'Assign provider to booking' })
  async assignProvider(
    @Param('id') id: string,
    @Body('providerId') providerId: string,
  ) {
    return this.bookingsService.assignProvider(id, providerId);
  }

  @Post(':id/cancel')
  @Roles(AdminUserRole.SUPER_ADMIN, AdminUserRole.OPERATIONS_ADMIN)
  @ApiOperation({ summary: 'Cancel booking' })
  async cancel(@Param('id') id: string, @Body('reason') reason: string) {
    return this.bookingsService.cancel(id, reason);
  }
}
