import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BookingStatus } from '@prisma/client';

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: any) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const { search, status } = query;
    const sortBy = query.sortBy || 'bookingDate';
    const sortOrder = query.sortOrder || 'desc';
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { bookingNumber: { contains: search, mode: 'insensitive' } },
        { serviceName: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    const [data, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        skip,
        take: limit,
        include: {
          customer: true,
          provider: true,
        },
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.booking.count({ where }),
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

  async findOne(id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        customer: true,
        provider: true,
      },
    });
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    return booking;
  }

  async getStats() {
    const [total, pendingAssignment, inProgress, completed, cancelled] =
      await Promise.all([
        this.prisma.booking.count(),
        this.prisma.booking.count({
          where: { status: BookingStatus.PENDING_ASSIGNMENT },
        }),
        this.prisma.booking.count({
          where: { status: BookingStatus.IN_PROGRESS },
        }),
        this.prisma.booking.count({
          where: { status: BookingStatus.COMPLETED },
        }),
        this.prisma.booking.count({
          where: { status: BookingStatus.CANCELLED },
        }),
      ]);

    const revenueResult = await this.prisma.booking.aggregate({
      where: { status: BookingStatus.COMPLETED },
      _sum: { amount: true },
    });

    const totalRevenue = Number(revenueResult._sum.amount || 0);
    const averageBookingValue = completed > 0 ? totalRevenue / completed : 0;

    return {
      total,
      pendingAssignment,
      inProgress,
      completed,
      cancelled,
      totalRevenue,
      averageBookingValue,
    };
  }

  async assignProvider(id: string, providerId: string) {
    await this.findOne(id);
    return this.prisma.booking.update({
      where: { id },
      data: {
        providerId,
        status: BookingStatus.ASSIGNED,
      },
    });
  }

  async cancel(id: string, reason: string) {
    await this.findOne(id);
    return this.prisma.booking.update({
      where: { id },
      data: {
        status: BookingStatus.CANCELLED,
        cancellationReason: reason,
        cancelledDate: new Date(),
      },
    });
  }
}
