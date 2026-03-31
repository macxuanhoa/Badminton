import { Controller, Post, Body, Get, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Role } from '../auth/types/role.enum';

@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post()
  async create(@Request() req, @Body() body: any) {
    const userId = req.user?.userId || null;
    return this.ordersService.createOrder(userId, body);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Request() req) {
    if (req.user.role !== Role.ADMIN && req.user.role !== Role.STAFF) {
      throw new ForbiddenException('Bạn không có quyền truy cập thông tin này.');
    }
    return this.ordersService.getOrders();
  }
}
