import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { type ISessionsRepository, SESSIONS_REPOSITORY } from './interfaces/sessions.repository.interface';
import { TokenService } from './token.service';
import { User } from '../users/entities/user.entity';

@Injectable()
export class SessionsService {
  constructor(
    @Inject(SESSIONS_REPOSITORY)
    private readonly sessionsRepository: ISessionsRepository,
    private readonly tokenService: TokenService,
  ) {}

  async createSession(user: User, refreshToken: string, deviceInfo?: string, orgId?: string, role?: string) {
    const days = this.tokenService.getRefreshTokenExpiresInDays();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + days);
 
    return this.sessionsRepository.create({
      user,
      refreshToken,
      expiresAt,
      deviceInfo,
      orgId,
      role,
    });
  }

  async findSessionById(id: string) {
    return this.sessionsRepository.findById(id);
  }

  async validateSession(refreshToken: string) {
    const session = await this.sessionsRepository.findByToken(refreshToken);
    if (!session || session.expiresAt < new Date()) {
      if (session) await this.sessionsRepository.deleteByToken(refreshToken);
      throw new UnauthorizedException('Refresh token không hợp lệ hoặc đã hết hạn');
    }
    return session;
  }

  async deleteSession(refreshToken: string) {
    await this.sessionsRepository.deleteByToken(refreshToken);
  }

  async deleteSessionById(sessionId: string) {
    await this.sessionsRepository.deleteById(sessionId);
  }

  async deleteAllSessionsForUser(userId: string) {
    await this.sessionsRepository.deleteAllForUser(userId);
  }
}
