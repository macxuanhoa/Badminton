import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async createOrder(
    userId: string | null,
    payload: {
      items: any[];
      total: number;
      guestName?: string;
      guestPhone?: string;
      guestAddress?: string;
      paymentMethod?: string;
    }
  ) {
    // 1. Check stock and validate products
    let calculatedTotal = 0;
    for (const item of payload.items) {
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId },
      });
      if (!product) throw new NotFoundException(`Sản phẩm ${item.name} không tồn tại.`);
      if (product.stock < item.quantity) {
        throw new BadRequestException(`Sản phẩm ${product.name} đã hết hàng.`);
      }
      calculatedTotal += product.price * item.quantity;
    }

    // 2. Validate required guest info if no userId
    if (!userId) {
      if (!payload.guestName || payload.guestName.trim() === '') {
        throw new BadRequestException('Vui lòng nhập họ tên người nhận.');
      }
      if (!payload.guestPhone || payload.guestPhone.trim() === '') {
        throw new BadRequestException('Vui lòng nhập số điện thoại liên lạc.');
      }
      if (!payload.guestAddress || payload.guestAddress.trim() === '') {
        throw new BadRequestException('Vui lòng nhập địa chỉ giao hàng.');
      }
    }

    // 3. Process payment if member (userId exists)
    let user = null;
    if (userId) {
      user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new NotFoundException('Người dùng không tồn tại.');
      
      // If payment is WALLET (implied if userId exists and not manual, but let's keep it simple)
      if (user.walletBalance < calculatedTotal) {
        throw new BadRequestException('Số dư ví không đủ.');
      }
    }

    // 4. Create Order & Update stock (Transaction)
    const orderCreate = this.prisma.order.create({
      data: {
        userId,
        guestName: payload.guestName,
        guestPhone: payload.guestPhone,
        guestAddress: payload.guestAddress,
        items: JSON.stringify(payload.items),
        total: calculatedTotal, // Use backend-calculated total, don't trust frontend total
        paymentMethod: payload.paymentMethod || 'CASH',
        status: 'PENDING',
      },
    });

    const stockUpdates = payload.items.map((item) =>
      this.prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      }),
    );

    if (userId) {
      const userUpdate = this.prisma.user.update({
            where: { id: userId },
            data: {
              walletBalance: { decrement: calculatedTotal },
              points: { increment: Math.floor(calculatedTotal / 1000) },
            },
          });
      const [order] = await this.prisma.$transaction([orderCreate, userUpdate, ...stockUpdates]);
      return order;
    }

    const [order] = await this.prisma.$transaction([orderCreate, ...stockUpdates]);
    return order;
  }

  async getOrders() {
    return this.prisma.order.findMany({
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
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
