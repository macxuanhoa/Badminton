import { Module } from '@nestjs/common';
import { GatewaysModule } from './gateways/gateways.module';
import { PrismaModule } from './prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { BookingsModule } from './bookings/bookings.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { CourtsModule } from './courts/courts.module';

@Module({
  imports: [PrismaModule, AuthModule, UsersModule, BookingsModule, ProductsModule, OrdersModule, GatewaysModule, CourtsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
