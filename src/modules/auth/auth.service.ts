import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { OrganizationsService } from '../organizations/organizations.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { TokenService } from './token.service';
import { SessionsService } from './sessions.service';
import { ServiceResult } from '../../common/utils/service-result';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private organizationsService: OrganizationsService,
    private tokenService: TokenService,
    private sessionsService: SessionsService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, name } = registerDto;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await this.usersService.create({ email, password: hashedPassword, name });
    const { password: _, ...result } = user;
    return ServiceResult.success(result, 'Đăng ký tài khoản thành công');
  }

  // 1. GLOBAL LOGIN: Không chứa ngữ cảnh Tenant
  async login(loginDto: LoginDto, deviceInfo?: string) {
    const { email, password } = loginDto;
    const user = await this.usersService.findByEmail(email);

    if (!user) throw new UnauthorizedException('Sai email hoặc mật khẩu');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('Sai email hoặc mật khẩu');

    const payload = { email: user.email, sub: user.id };
    const accessToken = this.tokenService.generateAccessToken(payload);
    const refreshToken = this.tokenService.generateRefreshToken();

    await this.sessionsService.createSession(user, refreshToken, deviceInfo);

    return ServiceResult.success(
      { access_token: accessToken, refresh_token: refreshToken, user: { id: user.id, email: user.email } },
      'Đăng nhập thành công'
    );
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

    const accessToken = this.tokenService.generateAccessToken(payload);
    const refreshToken = this.tokenService.generateRefreshToken();

    await this.sessionsService.createSession(user, refreshToken, deviceInfo);

    return ServiceResult.success(
      { access_token: accessToken, refresh_token: refreshToken, role: userOrg.role, orgId },
      'Chuyển đổi Tổ chức thành công'
    );
  }

  async logout(refreshToken: string) {
    await this.sessionsService.deleteSession(refreshToken);
    return ServiceResult.success(null, 'Đăng xuất thành công');
  }

  async refreshTokens(refreshToken: string, deviceInfo?: string, oldAccessToken?: string) {
    const session = await this.sessionsService.validateSession(refreshToken);

    // Phục hồi ngữ cảnh Tenant từ Access Token cũ (nếu có)
    let orgId = undefined, role = undefined;
    if (oldAccessToken) {
      const decoded: any = this.tokenService.decodeToken(oldAccessToken);
      if (decoded) {
        orgId = decoded.orgId;
        role = decoded.role;
      }
    }

    const payload = { email: session.user.email, sub: session.user.id, orgId, role };
    const newAccessToken = this.tokenService.generateAccessToken(payload);
    const newRefreshToken = this.tokenService.generateRefreshToken();

    await this.sessionsService.deleteSession(refreshToken);
    await this.sessionsService.createSession(session.user, newRefreshToken, deviceInfo || session.deviceInfo);

    return ServiceResult.success(
      { access_token: newAccessToken, refresh_token: newRefreshToken },
      'Gia hạn Token thành công'
    );
  }
}
