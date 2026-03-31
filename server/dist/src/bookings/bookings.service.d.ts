import { PrismaService } from '../prisma.service';
export declare class BookingsService {
    private prisma;
    constructor(prisma: PrismaService);
    createBooking(userId: string, courtId: string, slotId: string, isManual?: boolean): Promise<{
        id: string;
        slotId: string;
        totalPrice: number;
        status: string;
        createdAt: Date;
        userId: string;
        courtId: string;
    }>;
    cancelBooking(bookingId: string): Promise<{
        success: boolean;
    }>;
    getBookings(): Promise<({
        user: {
            id: string;
            createdAt: Date;
            name: string | null;
            email: string;
            password: string;
            role: string;
            walletBalance: number;
            membership: string;
            points: number;
            skillLevel: string | null;
        };
        court: {
            id: string;
            status: string;
            price: number;
            name: string;
            type: string;
            position: string | null;
        };
    } & {
        id: string;
        slotId: string;
        totalPrice: number;
        status: string;
        createdAt: Date;
        userId: string;
        courtId: string;
    })[]>;
}
