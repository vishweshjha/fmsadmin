import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: any) {
    const { page = 1, limit = 20, search, action, adminUserId } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { action: { contains: search, mode: 'insensitive' } },
        { entityName: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (action) {
      where.actionType = action;
    }

    if (adminUserId) {
      where.adminUserId = adminUserId;
    }

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        include: {
          adminUser: true,
        },
        orderBy: { timestamp: 'desc' },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalLogs, todayActions, failedActions] = await Promise.all([
      this.prisma.auditLog.count(),
      this.prisma.auditLog.count({
        where: {
          timestamp: {
            gte: today,
          },
        },
      }),
      this.prisma.auditLog.count({ where: { status: false } }),
    ]);

    return {
      totalLogs,
      todayActions,
      failedActions,
      activeAdmins: 8, // Mock - implement actual count
    };
  }
}
