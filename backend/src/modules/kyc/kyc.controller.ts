import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { KYCService } from './kyc.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminUserRole } from '@prisma/client';

@ApiTags('KYC & Verification')
@Controller('admin/kyc')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class KYCController {
  constructor(private readonly kycService: KYCService) {}

  @Get()
  @Roles(AdminUserRole.SUPER_ADMIN, AdminUserRole.COMPLIANCE_OFFICER)
  @ApiOperation({ summary: 'Get all KYC applications' })
  async findAll(@Query() query: any) {
    return this.kycService.findAll(query);
  }

  @Get('stats')
  @Roles(AdminUserRole.SUPER_ADMIN, AdminUserRole.COMPLIANCE_OFFICER)
  @ApiOperation({ summary: 'Get KYC statistics' })
  async getStats() {
    return this.kycService.getStats();
  }

  @Get(':id')
  @Roles(AdminUserRole.SUPER_ADMIN, AdminUserRole.COMPLIANCE_OFFICER)
  @ApiOperation({ summary: 'Get KYC application by ID' })
  async findOne(@Param('id') id: string) {
    return this.kycService.findOne(id);
  }

  @Post(':id/review')
  @Roles(AdminUserRole.SUPER_ADMIN, AdminUserRole.COMPLIANCE_OFFICER)
  @ApiOperation({ summary: 'Review KYC application' })
  async review(
    @Param('id') id: string,
    @Body('action') action: 'Approve' | 'Reject',
    @Body('remarks') remarks: string,
    @Body('reviewerId') reviewerId: string,
  ) {
    return this.kycService.review(id, action, remarks, reviewerId);
  }
}
