import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const prisma = this.prisma as unknown as any;
    return prisma.product.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    const prisma = this.prisma as unknown as any;
    return prisma.product.findUnique({ where: { id } });
  }

  async create(data: any) {
    const prisma = this.prisma as unknown as any;
    return prisma.product.create({ data });
  }

  async update(id: string, data: any) {
    const prisma = this.prisma as unknown as any;
    return prisma.product.update({ where: { id }, data });
  }

  async remove(id: string) {
    const prisma = this.prisma as unknown as any;
    return prisma.product.delete({ where: { id } });
  }
}
