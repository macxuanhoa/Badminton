import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { BookingGateway } from '../gateways/booking.gateway';

@Injectable()
export class BookingsService {
  constructor(
    private prisma: PrismaService,
    private bookingGateway: BookingGateway,
  ) {}

  async createBooking(
    userId: string | null,
    courtId: string,
    slotId: string,
    isManual: boolean = false,
    extraInfo?: {
      slotTime?: string;
      date?: string;
      fullName?: string;
      phone?: string;
      note?: string;
      paymentMethod?: string;
    }
  ) {
    if (!extraInfo?.date) {
      throw new BadRequestException('Vui lòng chọn ngày đặt sân.');
    }

    // 1. Check if slot is taken for that specific date
    const existing = await this.prisma.booking.findFirst({
      where: {
        courtId,
        slotId,
        date: extraInfo.date,
        status: { not: 'CANCELLED' },
      },
    });

    if (existing) {
      throw new BadRequestException('Khung giờ này vừa có người đặt xong.');
    }

    // 2. Check user and balance (if userId exists)
    let user = null;
    if (userId) {
      user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new NotFoundException('Người dùng không tồn tại.');
    }

    const slot = await this.prisma.slot.findUnique({ where: { id: slotId } });
    if (!slot) throw new NotFoundException('Khung giờ không tồn tại.');

    // Only check balance if it's a member booking (not manual and has userId)
    if (!isManual && userId && user && user.walletBalance < slot.price) {
      throw new BadRequestException('Số dư ví không đủ.');
    }

    const bookingCreate = this.prisma.booking.create({
      data: {
        userId,
        courtId,
        slotId,
        slotTime: extraInfo?.slotTime,
        date: extraInfo.date,
        fullName: extraInfo?.fullName,
        phone: extraInfo?.phone,
        note: extraInfo?.note,
        paymentMethod: extraInfo?.paymentMethod || 'CASH',
        totalPrice: slot.price,
        status: 'CONFIRMED',
      },
    });

    // Case 1: Manual (Staff/Admin) OR Guest (no userId)
    if (isManual || !userId) {
      const [booking] = await this.prisma.$transaction([bookingCreate]);
      this.bookingGateway.server.emit('BOOKING_CONFIRMED', booking);
      return booking;
    }

    // Case 2: Member (has userId)
    const userUpdate = this.prisma.user.update({
      where: { id: userId },
      data: {
        walletBalance: { decrement: slot.price },
        points: { increment: Math.floor(slot.price / 1000) },
      },
    });

    const [booking] = await this.prisma.$transaction([bookingCreate, userUpdate]);
    this.bookingGateway.server.emit('BOOKING_CONFIRMED', booking);
    return booking;
  }

  async cancelBooking(bookingId: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new NotFoundException('Không tìm thấy lịch đặt.');

    const [updated] = await this.prisma.$transaction([
      this.prisma.booking.update({
        where: { id: bookingId },
        data: { status: 'CANCELLED' },
      })
    ]);

    this.bookingGateway.server.emit('BOOKING_CANCELLED', updated);
    return { success: true };
  }

  async getBookings() {
    return this.prisma.booking.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            avatarUrl: true,
            role: true,
            membership: true,
            walletBalance: true,
            points: true,
            skillLevel: true,
            createdAt: true,
          },
        },
        court: {
          select: {
            id: true,
            name: true,
            type: true,
            status: true,
            price: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
