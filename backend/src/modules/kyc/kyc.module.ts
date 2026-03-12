import { Module } from '@nestjs/common';
import { KYCController } from './kyc.controller';
import { KYCService } from './kyc.service';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [KYCController],
  providers: [KYCService],
  exports: [KYCService],
})
export class KYCModule {}
