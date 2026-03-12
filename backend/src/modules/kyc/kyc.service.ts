import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { KYCStatus } from '@prisma/client';

@Injectable()
export class KYCService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: any) {
    const { page = 1, limit = 20, search, status, verificationLevel } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.provider = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    if (status) {
      where.status = status;
    }

    if (verificationLevel) {
      where.verificationLevel = verificationLevel;
    }

    const [data, total] = await Promise.all([
      this.prisma.kYCApplication.findMany({
        where,
        skip,
        take: limit,
        include: {
          provider: true,
          reviewer: true,
        },
        orderBy: { uploadedDate: 'desc' },
      }),
      this.prisma.kYCApplication.count({ where }),
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
    const kyc = await this.prisma.kYCApplication.findUnique({
      where: { id },
      include: {
        provider: true,
        reviewer: true,
      },
    });
    if (!kyc) {
      throw new NotFoundException('KYC application not found');
    }
    return kyc;
  }

  async getStats() {
    const [pending, approved, rejected, total] = await Promise.all([
      this.prisma.kYCApplication.count({ where: { status: KYCStatus.PENDING } }),
      this.prisma.kYCApplication.count({ where: { status: KYCStatus.APPROVED } }),
      this.prisma.kYCApplication.count({ where: { status: KYCStatus.REJECTED } }),
      this.prisma.kYCApplication.count(),
    ]);

    return {
      pending,
      approved,
      rejected,
      total,
    };
  }

  async review(id: string, action: 'Approve' | 'Reject', remarks: string, reviewerId: string) {
    await this.findOne(id);
    return this.prisma.kYCApplication.update({
      where: { id },
      data: {
        status: action === 'Approve' ? KYCStatus.APPROVED : KYCStatus.REJECTED,
        remarks,
        reviewerId,
        reviewedDate: new Date(),
        ...(action === 'Reject' && { rejectionReason: remarks }),
      },
    });
  }
}
