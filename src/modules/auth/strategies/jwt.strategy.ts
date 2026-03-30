import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { SessionsService } from '../sessions.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
    private sessionsService: SessionsService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.access_token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'defaultSecret',
    });
  }

  async validate(payload: any) {
    // 1. Kiểm tra session trong DB (Stateful check)
    if (!payload.sid) {
      throw new UnauthorizedException('Phiên làm việc không hợp lệ');
    }

    const session = await this.sessionsService.findSessionById(payload.sid);
    if (!session || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Phiên làm việc đã hết hạn hoặc bị thu hồi');
    }

    // 2. Kiểm tra người dùng (Sử dụng user từ session đã query luôn cho tối ưu)
    const user = session.user;
    if (!user) {
      throw new UnauthorizedException('Người dùng không tồn tại');
    }

    // Trả về user details để gắn vào req.user
    return { id: user.id, email: user.email, sid: payload.sid };
  }
}
