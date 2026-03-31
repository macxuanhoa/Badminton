import { BadRequestException, Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../auth/types/role.enum';
import { PrismaService } from '../prisma.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService, private prisma: PrismaService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get()
  async list() {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return users.map((u: any) => {
      const { password, ...rest } = u;
      return rest;
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    const data: any = {};

    if (body.role !== undefined) {
      const role = String(body.role);
      if (!['USER', 'STAFF', 'ADMIN'].includes(role)) throw new BadRequestException('Role không hợp lệ');
      data.role = role;
    }

    if (body.membership !== undefined) {
      const membership = String(body.membership);
      if (!['BASIC', 'SILVER', 'GOLD', 'PLATINUM'].includes(membership)) {
        throw new BadRequestException('Membership không hợp lệ');
      }
      data.membership = membership;
    }

    if (body.walletBalance !== undefined) {
      const v = Number(body.walletBalance);
      if (!Number.isFinite(v) || v < 0) throw new BadRequestException('walletBalance không hợp lệ');
      data.walletBalance = v;
    }

    if (body.points !== undefined) {
      const v = Number(body.points);
      if (!Number.isFinite(v) || v < 0) throw new BadRequestException('points không hợp lệ');
      data.points = Math.floor(v);
    }

    if (body.name !== undefined) data.name = body.name === null ? null : String(body.name);
    if (body.phone !== undefined) data.phone = body.phone === null ? null : String(body.phone);

    const updated = await this.prisma.user.update({
      where: { id },
      data,
    });

    const { password, ...rest } = updated as any;
    return rest;
  }
}
