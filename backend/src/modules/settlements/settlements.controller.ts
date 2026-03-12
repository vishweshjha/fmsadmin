import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SettlementsService } from './settlements.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminUserRole } from '@prisma/client';

@ApiTags('Settlements')
@Controller('admin/settlements')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SettlementsController {
  constructor(private readonly settlementsService: SettlementsService) {}

  @Get('provider-payouts')
  @Roles(AdminUserRole.SUPER_ADMIN, AdminUserRole.FINANCE_ADMIN)
  @ApiOperation({ summary: 'Get all provider payouts' })
  async findAllProviderPayouts(@Query() query: any) {
    return this.settlementsService.findAllProviderPayouts(query);
  }

  @Get('vendor-settlements')
  @Roles(AdminUserRole.SUPER_ADMIN, AdminUserRole.FINANCE_ADMIN)
  @ApiOperation({ summary: 'Get all vendor settlements' })
  async findAllVendorSettlements(@Query() query: any) {
    return this.settlementsService.findAllVendorSettlements(query);
  }
}
