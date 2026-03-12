import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminUserRole } from '@prisma/client';

@ApiTags('Audit')
@Controller('admin/audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @Roles(AdminUserRole.SUPER_ADMIN, AdminUserRole.COMPLIANCE_OFFICER)
  @ApiOperation({ summary: 'Get all audit logs' })
  async findAll(@Query() query: any) {
    return this.auditService.findAll(query);
  }

  @Get('stats')
  @Roles(AdminUserRole.SUPER_ADMIN, AdminUserRole.COMPLIANCE_OFFICER)
  @ApiOperation({ summary: 'Get audit statistics' })
  async getStats() {
    return this.auditService.getStats();
  }
}
