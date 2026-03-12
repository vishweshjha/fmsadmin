import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PricingService } from './pricing.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminUserRole } from '@prisma/client';

@ApiTags('Pricing')
@Controller('admin/pricing')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Get('services')
  @Roles(AdminUserRole.SUPER_ADMIN, AdminUserRole.FINANCE_ADMIN)
  @ApiOperation({ summary: 'Get all service pricing' })
  async findAllServices(@Query() query: any) {
    return this.pricingService.findAllServices(query);
  }

  @Get('surge-rules')
  @Roles(AdminUserRole.SUPER_ADMIN, AdminUserRole.FINANCE_ADMIN)
  @ApiOperation({ summary: 'Get all surge pricing rules' })
  async findAllSurgeRules() {
    return this.pricingService.findAllSurgeRules();
  }
}
