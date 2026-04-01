import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CourtsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.court.findMany();
  }

  async findSlots() {
    return this.prisma.slot.findMany();
  }
}
