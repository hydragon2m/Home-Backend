import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  generateAccessToken(payload: any): string {
    return this.jwtService.sign(payload);
  }

  generateRefreshToken(): string {
    return randomUUID();
  }

  decodeToken(token: string): any {
    try {
      return this.jwtService.decode(token);
    } catch (e) {
      return null;
    }
  }

  verifyToken(token: string): any {
    try {
      return this.jwtService.verify(token);
    } catch (e) {
      return null;
    }
  }

  getRefreshTokenExpiresInDays(): number {
    return this.configService.get<number>('REFRESH_TOKEN_EXPIRES_DAYS') || 7;
  }
}
