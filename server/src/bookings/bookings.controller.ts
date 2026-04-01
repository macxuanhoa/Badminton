import { Controller, Post, Body, Get, UseGuards, Request, Delete, Param, ForbiddenException } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/types/role.enum';

@Controller('bookings')
export class BookingsController {
  constructor(private bookingsService: BookingsService) {}

  @Post()
  async create(@Request() req, @Body() body: any) {
    // If no JWT (handled by making JwtAuthGuard optional or removing it for this route)
    const userId = req.user?.userId || null;
    const isManual = req.user?.role === Role.ADMIN || req.user?.role === Role.STAFF;
    
    return this.bookingsService.createBooking(
      userId,
      body.courtId,
      body.slotId,
      isManual,
      {
        slotTime: body.slotTime,
        date: body.date,
        fullName: body.fullName,
        phone: body.phone,
        note: body.note,
        paymentMethod: body.paymentMethod
      }
    );
  }

  @Get()
  async findAll() {
    return this.bookingsService.getBookings();
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async cancel(@Param('id') id: string) {
    return this.bookingsService.cancelBooking(id);
  }
}
