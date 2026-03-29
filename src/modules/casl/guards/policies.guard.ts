import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  AppAbility,
  CaslAbilityFactory,
} from '../casl-ability.factory';
import { CHECK_POLICIES_KEY, PolicyHandler } from '../decorators/check-policies.decorator';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserOrganization } from '../../organizations/entities/user-organization.entity';

@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private caslAbilityFactory: CaslAbilityFactory,
    @InjectRepository(UserOrganization)
    private userOrgRepository: Repository<UserOrganization>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const policyHandlers =
      this.reflector.get<PolicyHandler[]>(
        CHECK_POLICIES_KEY,
        context.getHandler(),
      ) || [];

    const request = context.switchToHttp().getRequest();
    const { user, params } = request;
    const orgId = params.orgId || params.id; // Lấy orgId từ tham số route

    if (!user) {
      return false;
    }

    // Lấy Role của User trong Organization này từ DB
    let role = null;
    if (orgId) {
      const userOrg = await this.userOrgRepository.findOne({
        where: { 
          user: { id: user.id } as any, 
          organization: { id: orgId } as any 
        },
      });
      role = userOrg?.role;
    }

    // Tạo Ability dựa trên Role thực tế trong Org này
    const ability = this.caslAbilityFactory.createForOrgContext(user.id, orgId, role);

    const isAllowed = policyHandlers.every((handler) =>
      this.execPolicyHandler(handler, ability),
    );

    if (!isAllowed) {
      throw new ForbiddenException('Bạn không có quyền thực hiện hành động này trong tổ chức.');
    }

    return true;
  }

  private execPolicyHandler(handler: PolicyHandler, ability: AppAbility) {
    if (typeof handler === 'function') {
      return handler(ability);
    }
    return handler.handle(ability);
  }
}
