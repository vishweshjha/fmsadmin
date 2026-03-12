import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminUserRole } from '@prisma/client';

@ApiTags('Analytics')
@Controller('admin/analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard-stats')
  @Roles(
    AdminUserRole.SUPER_ADMIN,
    AdminUserRole.OPERATIONS_ADMIN,
    AdminUserRole.FINANCE_ADMIN,
    AdminUserRole.SUPPORT_AGENT,
    AdminUserRole.COMPLIANCE_OFFICER,
  )
  @ApiOperation({ summary: 'Get dashboard statistics' })
  async getDashboardStats(@Query() query: any) {
    return this.analyticsService.getDashboardStats(query);
  }

  @Get('revenue')
  @Roles(AdminUserRole.SUPER_ADMIN, AdminUserRole.OPERATIONS_ADMIN, AdminUserRole.FINANCE_ADMIN)
  @ApiOperation({ summary: 'Get revenue analytics' })
  async getRevenueAnalytics(@Query() query: any) {
    return this.analyticsService.getRevenueAnalytics(query);
  }
}
