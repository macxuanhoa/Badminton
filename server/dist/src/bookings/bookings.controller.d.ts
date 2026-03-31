import { BookingsService } from './bookings.service';
export declare class BookingsController {
    private bookingsService;
    constructor(bookingsService: BookingsService);
    create(req: any, body: any): Promise<{
        id: string;
        slotId: string;
        totalPrice: number;
        status: string;
        createdAt: Date;
        userId: string;
        courtId: string;
    }>;
    findAll(req: any): Promise<({
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
    cancel(id: string): Promise<{
        success: boolean;
    }>;
}
