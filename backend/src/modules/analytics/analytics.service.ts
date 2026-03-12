import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BookingStatus, UserStatus, KYCStatus } from '@prisma/client';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats(query: any) {
    const { dateFrom, dateTo } = query;

    const [totalBookings, activeUsers, pendingKYC] = await Promise.all([
      this.prisma.booking.count(),
      this.prisma.user.count({ where: { status: UserStatus.ACTIVE } }),
      this.prisma.kYCApplication.count({ where: { status: KYCStatus.PENDING } }),
    ]);

    const revenueResult = await this.prisma.booking.aggregate({
      where: { status: BookingStatus.COMPLETED },
      _sum: { amount: true },
    });

    const revenue = Number(revenueResult._sum.amount || 0);

    return {
      totalBookings,
      activeUsers,
      revenue,
      pendingKYC,
      bookingsGrowth: 12, // Mock data - calculate from previous period
      usersGrowth: 8,
      revenueGrowth: 15,
      averageResponseTime: 2.3,
    };
  }

  async getRevenueAnalytics(query: any) {
    const { dateFrom, dateTo, granularity = 'day' } = query;
    // Mock implementation - implement actual date-based grouping
    return [
      { period: '2024-01-01', revenue: 420000, bookings: 45, averageBookingValue: 9333, growth: 12 },
      { period: '2024-01-02', revenue: 480000, bookings: 52, averageBookingValue: 9231, growth: 8 },
    ];
  }
}
