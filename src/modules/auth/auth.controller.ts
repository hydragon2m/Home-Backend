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
    this.setCookies(res, result.accessToken, result.refreshToken);
    return ServiceResult.success({ user: result.user }, 'Đăng nhập thành công');
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
    this.setCookies(res, result.accessToken, result.refreshToken);
    return ServiceResult.success(result.data, 'Chuyển đổi Tổ chức thành công');
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refreshTokens(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Headers('user-agent') deviceInfo?: string,
  ) {
    const refreshToken = req.cookies?.refresh_token;
    const oldAccessToken = req.cookies?.access_token;
    
    const result = await this.authService.refreshTokens(refreshToken, deviceInfo, oldAccessToken);
    
    this.setCookies(res, result.accessToken, result.refreshToken);
    return ServiceResult.success(null, 'Gia hạn Token thành công');
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @GetUser('sid') sid: string,
  ) {
    if (sid) {
      await this.authService.logoutBySessionId(sid);
    }
    
    // Fallback: Xóa theo refresh token nếu sid không tồn tại vì lý do nào đó
    const refreshToken = req.cookies?.refresh_token;
    if (refreshToken && !sid) {
      await this.authService.logout(refreshToken);
    }
    
    const baseOptions = this.getCookieOptions();
    res.clearCookie('access_token', baseOptions);
    res.clearCookie('refresh_token', { ...baseOptions, path: '/auth' });
    
    return ServiceResult.success(null, 'Đăng xuất thành công');
  }

  private setCookies(res: Response, accessToken: string, refreshToken: string) {
    const baseOptions = this.getCookieOptions();
    
    res.cookie('access_token', accessToken, {
      ...baseOptions,
      maxAge: 15 * 60 * 1000, // 15 mins
    });

    res.cookie('refresh_token', refreshToken, {
      ...baseOptions,
      path: '/auth', 
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  private getCookieOptions() {
    const isProduction = this.configService.get('NODE_ENV') === 'production';
    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax' as const,
    };
  }
}
