import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from './entities/organization.entity';
import { UserOrganization } from './entities/user-organization.entity';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(Organization)
    private readonly orgRepository: Repository<Organization>,
    @InjectRepository(UserOrganization)
    private readonly userOrgRepository: Repository<UserOrganization>,
  ) {}

  async getUserOrganizations(userId: string) {
    const userOrgs = await this.userOrgRepository.find({
      where: { user: { id: userId } },
      relations: ['organization'],
    });
    return userOrgs.map(uo => ({
      organization: uo.organization,
      role: uo.role,
    }));
  }

  async verifyUserInOrg(userId: string, orgId: string): Promise<UserOrganization> {
    const userOrg = await this.userOrgRepository.findOne({
      where: { user: { id: userId }, organization: { id: orgId } }
    });
    if (!userOrg) {
      throw new NotFoundException('Bạn không thuộc tổ chức này hoặc tổ chức không tồn tại');
    }
    return userOrg;
  }
}
