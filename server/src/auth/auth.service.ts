import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  private hashToken(token: string) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        role: user.role,
        walletBalance: user.walletBalance,
        membership: user.membership,
        points: user.points,
      },
    };
  }

  async register(data: any) {
    const email = String(data.email || '').trim().toLowerCase()
    const password = String(data.password || '')
    const name = data.name !== undefined ? String(data.name || '').trim() : undefined
    const phone = data.phone !== undefined ? String(data.phone || '').trim() : undefined

    if (!email) throw new BadRequestException('Vui lòng nhập email')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new BadRequestException('Email không hợp lệ')
    if (!password || password.length < 8) throw new BadRequestException('Mật khẩu tối thiểu 8 ký tự')

    const existing = await this.usersService.findOne(email)
    if (existing) throw new BadRequestException('Email đã được sử dụng')

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.usersService.create({
      email,
      password: hashedPassword,
      name: name || undefined,
      phone: phone || undefined,
    } as any);

    const { password: _pw, ...safe } = user as any
    return this.login(safe)
  }

  async forgotPassword(emailRaw: string) {
    const email = String(emailRaw || '').trim().toLowerCase()
    if (!email) throw new BadRequestException('Vui lòng nhập email')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new BadRequestException('Email không hợp lệ')

    const user = await this.usersService.findOne(email)
    if (!user) {
      return { ok: true }
    }

    const token = crypto.randomBytes(32).toString('hex')
    const tokenHash = this.hashToken(token)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000)

    await this.usersService.updateById(user.id, {
      passwordResetTokenHash: tokenHash,
      passwordResetExpiresAt: expiresAt,
    } as any)

    return { ok: true, email, resetToken: token }
  }

  async resetPassword(payload: { email: string; token: string; newPassword: string }) {
    const email = String(payload.email || '').trim().toLowerCase()
    const token = String(payload.token || '').trim()
    const newPassword = String(payload.newPassword || '')

    if (!email) throw new BadRequestException('Vui lòng nhập email')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new BadRequestException('Email không hợp lệ')
    if (!token) throw new BadRequestException('Token không hợp lệ')
    if (!newPassword || newPassword.length < 8) throw new BadRequestException('Mật khẩu tối thiểu 8 ký tự')

    const user = await this.usersService.findOne(email)
    if (!user) throw new BadRequestException('Token không hợp lệ hoặc đã hết hạn')

    const tokenHash = this.hashToken(token)
    const expiresAt = (user as any).passwordResetExpiresAt as Date | null | undefined
    const savedHash = (user as any).passwordResetTokenHash as string | null | undefined
    if (!expiresAt || !savedHash) throw new BadRequestException('Token không hợp lệ hoặc đã hết hạn')
    if (expiresAt.getTime() < Date.now()) throw new BadRequestException('Token đã hết hạn')
    if (savedHash !== tokenHash) throw new BadRequestException('Token không hợp lệ hoặc đã hết hạn')

    const hashedPassword = await bcrypt.hash(newPassword, 10)
    await this.usersService.updateById(user.id, {
      password: hashedPassword,
      passwordResetTokenHash: null,
      passwordResetExpiresAt: null,
    } as any)

    return { ok: true }
  }
}
