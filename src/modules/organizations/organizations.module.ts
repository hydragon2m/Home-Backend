import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization } from './entities/organization.entity';
import { UserOrganization } from './entities/user-organization.entity';
import { OrganizationsService } from './organizations.service';
import { OrganizationsController } from './organizations.controller';
import { Invitation } from './entities/invitation.entity';
import { InvitationsService } from './invitations.service';
import { ORGANIZATIONS_REPOSITORY } from './interfaces/organizations.repository.interface';
import { OrganizationsRepository } from './repositories/organizations.repository';
import { INVITATIONS_REPOSITORY } from './interfaces/invitations.repository.interface';
import { InvitationsRepository } from './repositories/invitations.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Organization, UserOrganization, Invitation])],
  controllers: [OrganizationsController],
  providers: [
    OrganizationsService, 
    InvitationsService,
    {
      provide: ORGANIZATIONS_REPOSITORY,
      useClass: OrganizationsRepository,
    },
    {
      provide: INVITATIONS_REPOSITORY,
      useClass: InvitationsRepository,
    }
  ],
  exports: [OrganizationsService, InvitationsService, ORGANIZATIONS_REPOSITORY],
})
export class OrganizationsModule {}
