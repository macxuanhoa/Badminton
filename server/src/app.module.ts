import { Module } from '@nestjs/common';
import { BookingGateway } from './gateways/booking.gateway';
import { PrismaModule } from './prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { BookingsModule } from './bookings/bookings.module';
import { ProductsModule } from './products/products.module';

@Module({
  imports: [PrismaModule, AuthModule, UsersModule, BookingsModule, ProductsModule],
  controllers: [],
  providers: [BookingGateway],
})
export class AppModule {}
