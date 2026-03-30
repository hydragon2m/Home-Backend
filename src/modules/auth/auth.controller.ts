import { Controller, Post, Body, HttpCode, HttpStatus, Get, UseGuards, Res, Headers, Req } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { ServiceResult } from '../../common/utils/service-result';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

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
    const result = await this.authService.login(loginDto, deviceInfo);
    this.setCookies(res, result.data.access_token, result.data.refresh_token);
    return result;
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
    const result = await this.authService.swapTokenToTenant(userId, orgId, deviceInfo);
    this.setCookies(res, result.data.access_token, result.data.refresh_token);
    
    return result;
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refreshTokens(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body('refreshToken') bodyRefreshToken?: string, // Fallback nếu không dùng cookie
    @Headers('user-agent') deviceInfo?: string,
  ) {
    // Ưu tiên lấy từ cookie, nếu không có lấy từ body
    const refreshToken = req.cookies?.refresh_token || bodyRefreshToken;
    const oldAccessToken = req.cookies?.access_token;
    
    const result = await this.authService.refreshTokens(refreshToken, deviceInfo, oldAccessToken);
    
    this.setCookies(res, result.data.access_token, result.data.refresh_token);
    return result;
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refresh_token;
    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }
    
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    
    return ServiceResult.success(null, 'Đăng xuất thành công');
  }

  private setCookies(res: Response, accessToken: string, refreshToken: string) {
    const isProduction = this.configService.get('NODE_ENV') === 'production';
    
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 mins
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/auth/refresh', 
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }
}
