"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let BookingsService = class BookingsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createBooking(userId, courtId, slotId, isManual = false) {
        const existing = await this.prisma.booking.findFirst({
            where: {
                courtId,
                slotId,
                status: { not: 'CANCELLED' },
            },
        });
        if (existing) {
            throw new common_1.BadRequestException('Khung giờ này vừa có người đặt xong.');
        }
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('Người dùng không tồn tại.');
        const slot = await this.prisma.slot.findUnique({ where: { id: slotId } });
        if (!slot)
            throw new common_1.NotFoundException('Khung giờ không tồn tại.');
        if (!isManual && user.walletBalance < slot.price) {
            throw new common_1.BadRequestException('Số dư ví không đủ.');
        }
        const bookingCreate = this.prisma.booking.create({
            data: {
                userId,
                courtId,
                slotId,
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
    async cancelBooking(bookingId) {
        const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
        if (!booking)
            throw new common_1.NotFoundException('Không tìm thấy lịch đặt.');
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
};
exports.BookingsService = BookingsService;
exports.BookingsService = BookingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BookingsService);
//# sourceMappingURL=bookings.service.js.map