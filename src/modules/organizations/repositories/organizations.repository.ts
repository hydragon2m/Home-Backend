import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from '../entities/organization.entity';
import { IOrganizationsRepository } from '../interfaces/organizations.repository.interface';
import { UserOrganization } from '../entities/user-organization.entity';

@Injectable()
export class OrganizationsRepository implements IOrganizationsRepository {
  constructor(
    @InjectRepository(Organization)
    private readonly repository: Repository<Organization>,
    @InjectRepository(UserOrganization)
    private readonly userOrgRepository: Repository<UserOrganization>,
  ) {}

  async findById(id: string): Promise<Organization | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findUserOrganizations(userId: string): Promise<Organization[]> {
    const userOrgs = await this.userOrgRepository.find({
      where: { user: { id: userId } },
      relations: ['organization'],
    });
    return userOrgs.map(uo => uo.organization);
  }

  async findUserOrganization(userId: string, orgId: string): Promise<UserOrganization | null> {
    return this.userOrgRepository.findOne({
      where: { user: { id: userId }, organization: { id: orgId } }
    });
  }

  async save(org: Partial<Organization>): Promise<Organization> {
    return this.repository.save(org);
  }

  async saveUserOrganization(userOrg: Partial<UserOrganization>): Promise<UserOrganization> {
    return this.userOrgRepository.save(this.userOrgRepository.create(userOrg));
  }
}
