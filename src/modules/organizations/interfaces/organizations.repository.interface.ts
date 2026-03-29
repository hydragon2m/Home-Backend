import { Organization } from '../entities/organization.entity';

export interface IOrganizationsRepository {
  findById(id: string): Promise<Organization | null>;
  findUserOrganizations(userId: string): Promise<Organization[]>;
  findUserOrganization(userId: string, orgId: string): Promise<any>;
  save(org: Partial<Organization>): Promise<Organization>;
  saveUserOrganization(userOrg: any): Promise<any>;
}

export const ORGANIZATIONS_REPOSITORY = 'IOrganizationsRepository';
