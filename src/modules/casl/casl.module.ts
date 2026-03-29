import { Module, Global } from '@nestjs/common';
import { CaslAbilityFactory } from './casl-ability.factory';

import { TypeOrmModule } from '@nestjs/typeorm';
import { UserOrganization } from '../organizations/entities/user-organization.entity';
import { PoliciesGuard } from './guards/policies.guard';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([UserOrganization])],
  providers: [CaslAbilityFactory, PoliciesGuard],
  exports: [CaslAbilityFactory, PoliciesGuard],
})
export class CaslModule {}
