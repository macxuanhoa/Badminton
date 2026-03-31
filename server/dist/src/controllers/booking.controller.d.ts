import { PrismaService } from '../prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
export declare class BookingController {
    private prisma;
    constructor(prisma: PrismaService);
    createBooking(dto: CreateBookingDto): Promise<{
        slotId: string;
        userId: string;
        courtId: string;
        id: string;
        status: import(".prisma/client").$Enums.BookingStatus;
        paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
        totalPrice: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getCourtSlots(courtId: string): Promise<{
        courtId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        startTime: Date;
        endTime: Date;
        isLocked: boolean;
        lockedBy: string | null;
        lockExp: Date | null;
    }[]>;
}
