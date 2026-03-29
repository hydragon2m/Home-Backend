import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { UsersService } from '../users/users.service';
import { OrganizationsService } from '../organizations/organizations.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { type ISessionsRepository, SESSIONS_REPOSITORY } from './interfaces/sessions.repository.interface';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private organizationsService: OrganizationsService,
    private jwtService: JwtService,
    @Inject(SESSIONS_REPOSITORY)
    private sessionsRepository: ISessionsRepository,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password } = registerDto;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await this.usersService.create({ email, password: hashedPassword });
    const { password: _, ...result } = user;
    return result;
  }

  // 1. GLOBAL LOGIN: Không chứa ngữ cảnh Tenant
  async login(loginDto: LoginDto, deviceInfo?: string) {
    const { email, password } = loginDto;
    const user = await this.usersService.findByEmail(email);

    if (!user) throw new UnauthorizedException('Sai email hoặc mật khẩu');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('Sai email hoặc mật khẩu');

    const payload = { email: user.email, sub: user.id };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = randomUUID();

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.sessionsRepository.create({
      user, refreshToken, expiresAt, deviceInfo,
    });

    return { access_token: accessToken, refresh_token: refreshToken, user: { id: user.id, email: user.email } };
  }

  // 2. TENANT LOGIN (TOKEN SWAPPING): Chứa ngữ cảnh Tenant
  async swapTokenToTenant(userId: string, orgId: string, deviceInfo?: string) {
    const userOrg = await this.organizationsService.verifyUserInOrg(userId, orgId);
    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException('Người dùng không tồn tại');

    const payload = { 
      email: user.email, 
      sub: user.id, 
      orgId: orgId, 
      role: userOrg.role 
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = randomUUID();

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.sessionsRepository.create({
      user, refreshToken, expiresAt, deviceInfo,
    });

    return { access_token: accessToken, refresh_token: refreshToken, role: userOrg.role, orgId };
  }

  async logout(refreshToken: string) {
    await this.sessionsRepository.deleteByToken(refreshToken);
    return { message: 'Đăng xuất thành công' };
  }

  async refreshTokens(refreshToken: string, deviceInfo?: string, oldAccessToken?: string) {
    const session = await this.sessionsRepository.findByToken(refreshToken);
    if (!session || session.expiresAt < new Date()) {
      if (session) await this.sessionsRepository.deleteByToken(refreshToken);
      throw new UnauthorizedException('Refresh token không hợp lệ hoặc đã hết hạn');
    }

    // Phục hồi ngữ cảnh Tenant từ Access Token cũ (nếu có)
    let orgId = undefined, role = undefined;
    if (oldAccessToken) {
      const decoded: any = this.jwtService.decode(oldAccessToken);
      if (decoded) {
        orgId = decoded.orgId;
        role = decoded.role;
      }
    }

    const payload = { email: session.user.email, sub: session.user.id, orgId, role };
    const newAccessToken = this.jwtService.sign(payload);
    const newRefreshToken = randomUUID();

    await this.sessionsRepository.deleteByToken(refreshToken);
    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + 7);
    
    await this.sessionsRepository.create({
      user: session.user, refreshToken: newRefreshToken, expiresAt: newExpiresAt, deviceInfo: deviceInfo || session.deviceInfo,
    });

    return { access_token: newAccessToken, refresh_token: newRefreshToken };
  }
}
