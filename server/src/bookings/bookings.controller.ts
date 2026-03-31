import { Controller, Post, Body, Get, UseGuards, Request, Delete, Param, ForbiddenException } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/types/role.enum';

@Controller('bookings')
export class BookingsController {
  constructor(private bookingsService: BookingsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Request() req, @Body() body: any) {
    const isManual = req.user.role === Role.ADMIN || req.user.role === Role.STAFF;
    return this.bookingsService.createBooking(
      req.user.userId,
      body.courtId,
      body.slotId,
      isManual,
      {
        slotTime: body.slotTime,
        fullName: body.fullName,
        phone: body.phone,
        note: body.note,
        paymentMethod: body.paymentMethod
      }
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Request() req) {
    // Only Admin/Staff can see all bookings
    if (req.user.role !== Role.ADMIN && req.user.role !== Role.STAFF) {
      throw new ForbiddenException('Bạn không có quyền truy cập thông tin này.');
    }
    return this.bookingsService.getBookings();
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async cancel(@Param('id') id: string) {
    return this.bookingsService.cancelBooking(id);
  }
}
