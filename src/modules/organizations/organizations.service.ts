import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { Organization } from './entities/organization.entity';
import { UserOrganization, OrgRole } from './entities/user-organization.entity';
import { ORGANIZATIONS_REPOSITORY, IOrganizationsRepository } from './interfaces/organizations.repository.interface';
import { ServiceResult } from '../../common/utils/service-result';

@Injectable()
export class OrganizationsService {
  constructor(
    @Inject(ORGANIZATIONS_REPOSITORY)
    private readonly orgRepository: IOrganizationsRepository,
  ) {}

  async getUserOrganizations(userId: string) {
    const orgs = await this.orgRepository.findUserOrganizations(userId);
    return ServiceResult.success(orgs, 'Lấy danh sách Tổ chức thành công');
  }

  async verifyUserInOrg(userId: string, orgId: string): Promise<any> {
    const userOrg = await this.orgRepository.findUserOrganization(userId, orgId);
    if (!userOrg) {
      throw new NotFoundException('Người dùng không thuộc Tổ chức này hoặc Tổ chức không tồn tại');
    }
    return userOrg;
  }

  async getOrganizationById(userId: string, orgId: string) {
    await this.verifyUserInOrg(userId, orgId);
    const org = await this.orgRepository.findById(orgId);
    return ServiceResult.success(org, 'Lấy thông tin Tổ chức thành công');
  }

  async getOrganizationMembers(userId: string, orgId: string) {
    await this.verifyUserInOrg(userId, orgId);
    const members = await this.orgRepository.findOrganizationMembers(orgId);
    return ServiceResult.success(members, 'Lấy danh sách thành viên thành công');
  }
  
  async create(userId: string, name: string) {
    const org = await this.orgRepository.save({ name });
    
    // Auto-link creator as ORG_ADMIN
    await this.orgRepository.saveUserOrganization({
      user: { id: userId } as any,
      organization: { id: org.id } as any,
      role: OrgRole.ORG_ADMIN,
    });
    
    return ServiceResult.success(org, 'Tạo Tổ chức thành công');
  }
}
