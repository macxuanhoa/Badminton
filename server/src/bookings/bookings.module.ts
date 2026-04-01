import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { PrismaModule } from '../prisma.module';
import { AuthModule } from '../auth/auth.module';

import { GatewaysModule } from '../gateways/gateways.module';

@Module({
  imports: [PrismaModule, AuthModule, GatewaysModule],
  providers: [BookingsService],
  controllers: [BookingsController],
  exports: [BookingsService],
})
export class BookingsModule {}
