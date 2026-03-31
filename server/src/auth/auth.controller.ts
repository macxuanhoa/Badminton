import { Controller, Post, Body, UnauthorizedException, Get, UseGuards, Request, Patch } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService, private usersService: UsersService) {}

  @Post('login')
  async login(@Body() body: any) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      throw new UnauthorizedException('Thông tin đăng nhập không chính xác');
    }
    return this.authService.login(user);
  }

  @Post('register')
  async register(@Body() body: any) {
    return this.authService.register(body);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() body: any) {
    return this.authService.forgotPassword(body.email);
  }

  @Post('reset-password')
  async resetPassword(@Body() body: any) {
    return this.authService.resetPassword({
      email: body.email,
      token: body.token,
      newPassword: body.newPassword,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Request() req) {
    const user = await this.usersService.findById(req.user.userId);
    if (!user) throw new UnauthorizedException('Người dùng không tồn tại');
    const { password, ...result } = user as any;
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateMe(@Request() req, @Body() body: any) {
    const updated = await this.usersService.updateById(req.user.userId, {
      name: body.name,
      phone: body.phone,
      avatarUrl: body.avatarUrl,
    });
    const { password, ...result } = updated as any;
    return result;
  }
}
