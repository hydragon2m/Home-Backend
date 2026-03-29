import { Controller, Post, Body, HttpCode, HttpStatus, Get, UseGuards, Res, Headers } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Headers('user-agent') deviceInfo: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { access_token, refresh_token, user } = await this.authService.login(loginDto, deviceInfo);

    this.setCookies(res, access_token, refresh_token);
    return { user, message: 'Đăng nhập thành công' };
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @Post('swap-token')
  async swapToken(
    @Body('orgId') orgId: string,
    @GetUser('id') userId: string,
    @Headers('user-agent') deviceInfo: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const newTokens = await this.authService.swapTokenToTenant(userId, orgId, deviceInfo);
    this.setCookies(res, newTokens.access_token, newTokens.refresh_token);
    
    return { role: newTokens.role, orgId: newTokens.orgId, message: 'Đăng nhập vào Tổ chức thành công' };
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refreshTokens(
    @Res({ passthrough: true }) res: Response,
    @Body('refreshToken') bodyRefreshToken?: string, // Fallback nếu không dùng cookie
    @Headers('user-agent') deviceInfo?: string,
  ) {
    // Ưu tiên lấy từ cookie, nếu không có lấy từ body
    const refreshToken = bodyRefreshToken; // Note: Ở đây có thể lấy từ cookie nếu cần
    const newTokens = await this.authService.refreshTokens(refreshToken, deviceInfo);
    
    this.setCookies(res, newTokens.access_token, newTokens.refresh_token);
    return { message: 'Gia hạn token thành công' };
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    return { message: 'Đăng xuất thành công' };
  }

  private setCookies(res: Response, accessToken: string, refreshToken: string) {
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, 
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/auth/refresh', 
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }
}
