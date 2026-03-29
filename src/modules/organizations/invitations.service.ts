import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invitation } from './entities/invitation.entity';
import { UserOrganization, OrgRole } from './entities/user-organization.entity';
import * as crypto from 'crypto';

@Injectable()
export class InvitationsService {
  constructor(
    @InjectRepository(Invitation)
    private readonly invitationRepository: Repository<Invitation>,
    @InjectRepository(UserOrganization)
    private readonly userOrgRepository: Repository<UserOrganization>,
  ) {}

  async createInvite(
    organizationId: string,
    invitedById: string,
    role: OrgRole = OrgRole.ORG_MEMBER,
    expiresInDays: number = 7,
  ) {
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    const invitation = this.invitationRepository.create({
      code,
      organizationId,
      invitedById,
      role,
      expiresAt,
    });

    return this.invitationRepository.save(invitation);
  }

  async acceptInvite(userId: string, code: string) {
    const invitation = await this.invitationRepository.findOne({
      where: { code, isActive: true },
      relations: ['organization'],
    });

    if (!invitation) {
      throw new NotFoundException('Mã mời không tồn tại hoặc đã bị vô hiệu hóa.');
    }

    if (invitation.expiresAt && invitation.expiresAt < new Date()) {
      throw new BadRequestException('Mã mời đã hết hạn.');
    }

    if (invitation.usesCount >= invitation.maxUses) {
      throw new BadRequestException('Mã mời đã đạt giới hạn số lần sử dụng.');
    }

    // Kiểm tra xem user đã trong tổ chức chưa
    const existingMember = await this.userOrgRepository.findOne({
      where: { 
        user: { id: userId } as any, 
        organization: { id: invitation.organizationId } as any 
      },
    });

    if (existingMember) {
      throw new BadRequestException('Bạn đã là thành viên của tổ chức này.');
    }

    // Thêm user vào tổ chức
    const userOrg = this.userOrgRepository.create({
      user: { id: userId } as any,
      organization: { id: invitation.organizationId } as any,
      role: invitation.role,
    });

    await this.userOrgRepository.save(userOrg);

    // Cập nhật số lần sử dụng
    invitation.usesCount += 1;
    if (invitation.usesCount >= invitation.maxUses) {
      invitation.isActive = false;
    }
    await this.invitationRepository.save(invitation);

    return {
      message: 'Tham gia tổ chức thành công',
      organization: invitation.organization,
    };
  }
}
