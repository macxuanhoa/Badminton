import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  async createBooking(
    userId: string,
    courtId: string,
    slotId: string,
    isManual: boolean = false,
    extraInfo?: {
      slotTime?: string;
      fullName?: string;
      phone?: string;
      note?: string;
      paymentMethod?: string;
    }
  ) {
    // 1. Check if slot is taken
    const existing = await this.prisma.booking.findFirst({
      where: {
        courtId,
        slotId,
        status: { not: 'CANCELLED' },
      },
    });

    if (existing) {
      throw new BadRequestException('Khung giờ này vừa có người đặt xong.');
    }

    // 2. Check user and balance
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Người dùng không tồn tại.');

    const slot = await this.prisma.slot.findUnique({ where: { id: slotId } });
    if (!slot) throw new NotFoundException('Khung giờ không tồn tại.');

    if (!isManual && user.walletBalance < slot.price) {
      throw new BadRequestException('Số dư ví không đủ.');
    }

    const bookingCreate = this.prisma.booking.create({
      data: {
        userId,
        courtId,
        slotId,
        slotTime: extraInfo?.slotTime,
        fullName: extraInfo?.fullName,
        phone: extraInfo?.phone,
        note: extraInfo?.note,
        paymentMethod: extraInfo?.paymentMethod || 'CASH',
        totalPrice: slot.price,
        status: 'CONFIRMED',
      },
    });

    const courtUpdate = this.prisma.court.update({
      where: { id: courtId },
      data: { status: 'BOOKED' },
    });

    if (isManual) {
      const [booking] = await this.prisma.$transaction([bookingCreate, courtUpdate]);
      return booking;
    }

    const userUpdate = this.prisma.user.update({
      where: { id: userId },
      data: {
        walletBalance: { decrement: slot.price },
        points: { increment: Math.floor(slot.price / 1000) },
      },
    });

    const [booking] = await this.prisma.$transaction([bookingCreate, userUpdate, courtUpdate]);
    return booking;
  }

  async cancelBooking(bookingId: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new NotFoundException('Không tìm thấy lịch đặt.');

    await this.prisma.$transaction([
      this.prisma.booking.update({
        where: { id: bookingId },
        data: { status: 'CANCELLED' },
      }),
      this.prisma.court.update({
        where: { id: booking.courtId },
        data: { status: 'AVAILABLE' },
      }),
    ]);

    return { success: true };
  }

  async getBookings() {
    return this.prisma.booking.findMany({
      include: {
        user: true,
        court: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
