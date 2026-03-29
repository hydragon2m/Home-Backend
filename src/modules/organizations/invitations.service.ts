import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { Invitation } from './entities/invitation.entity';
import { OrgRole } from './entities/user-organization.entity';
import { INVITATIONS_REPOSITORY, IInvitationsRepository } from './interfaces/invitations.repository.interface';
import { ORGANIZATIONS_REPOSITORY, IOrganizationsRepository } from './interfaces/organizations.repository.interface';
import * as crypto from 'crypto';

@Injectable()
export class InvitationsService {
  constructor(
    @Inject(INVITATIONS_REPOSITORY)
    private readonly invitationRepository: IInvitationsRepository,
    @Inject(ORGANIZATIONS_REPOSITORY)
    private readonly orgRepository: IOrganizationsRepository,
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

    const invitation = {
      code,
      organizationId,
      invitedById,
      role,
      expiresAt,
    };

    return this.invitationRepository.save(invitation);
  }

  async acceptInvite(userId: string, code: string) {
    const invitation = await this.invitationRepository.findByCode(code);

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
    const existingMember = await this.orgRepository.findUserOrganization(userId, invitation.organizationId);

    if (existingMember) {
      throw new BadRequestException('Bạn đã là thành viên của tổ chức này.');
    }

    // Thêm user vào tổ chức
    await this.orgRepository.saveUserOrganization({
      user: { id: userId } as any,
      organization: { id: invitation.organizationId } as any,
      role: invitation.role,
    });

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
