import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { Organization } from './entities/organization.entity';
import { UserOrganization } from './entities/user-organization.entity';
import { ORGANIZATIONS_REPOSITORY, IOrganizationsRepository } from './interfaces/organizations.repository.interface';

@Injectable()
export class OrganizationsService {
  constructor(
    @Inject(ORGANIZATIONS_REPOSITORY)
    private readonly orgRepository: IOrganizationsRepository,
  ) {}

  async getUserOrganizations(userId: string) {
    return this.orgRepository.findUserOrganizations(userId);
  }

  async verifyUserInOrg(userId: string, orgId: string): Promise<any> {
    const org = await this.orgRepository.findById(orgId);
    if (!org) {
      throw new NotFoundException('Tổ chức không tồn tại');
    }
    // Note: Ở đây có thêm logic check membership nếu cần
    return org;
  }
}
