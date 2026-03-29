import {
  Controller,
  Post,
  Body,
  UseGuards,
  Param,
  Get,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';
import { InvitationsService } from './invitations.service';
import { OrgRole } from './entities/user-organization.entity';
import { PoliciesGuard } from '../casl/guards/policies.guard';
import { CheckPolicies } from '../casl/decorators/check-policies.decorator';
import { Action } from '../casl/casl-ability.factory';

@Controller('organizations')
@UseGuards(JwtAuthGuard)
export class OrganizationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Post(':orgId/invites')
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability) => ability.can(Action.Manage, 'all'))
  async createInvite(
    @Param('orgId') orgId: string,
    @GetUser() user: User,
    @Body('role') role: OrgRole,
    @Body('expiresInDays') expiresInDays: number,
  ) {
    // Note: Ở đây nên có check Policy xem user có quyền invite không (e.g. Admin/Owner)
    return this.invitationsService.createInvite(orgId, user.id, role, expiresInDays);
  }

  @Post('join/:code')
  async join(@Param('code') code: string, @GetUser() user: User) {
    return this.invitationsService.acceptInvite(user.id, code);
  }
}
