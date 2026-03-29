import { AbilityBuilder, ExtractSubjectType, InferSubjects, MongoAbility, createMongoAbility } from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { User } from '../users/entities/user.entity';
import { OrgRole } from '../organizations/entities/user-organization.entity';

export enum Action {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}

// Định nghĩa một interface chung cho các tài nguyên có gắn OrganizationId
// Sau này các Entity như Article, Project... sẽ implement interface này hoặc có property này.
export interface ITenantResource {
  organizationId: string;
}

type Subjects = InferSubjects<typeof User> | ITenantResource | 'all';

export type AppAbility = MongoAbility<[Action, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
  createForOrgContext(userId: string, orgId?: string, orgRole?: OrgRole) {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

    // Nếu có ngữ cảnh công ty, áp dụng luật Tenant Isolation
    if (orgId) {
      can(Action.Manage, 'all', { organizationId: orgId } as any);
    }

    if (orgRole === OrgRole.ORG_ADMIN) {
      can(Action.Manage, 'all'); 
    } else if (orgRole === OrgRole.ORG_MEMBER) {
      can(Action.Read, 'all');
      // Thêm các luật bảo vệ mức cá nhân bên trong tổ chức
      // can(Action.Update, Article, { authorId: userId }); 
    }

    return build({
      detectSubjectType: (item) => item.constructor as ExtractSubjectType<Subjects>,
    });
  }
}
