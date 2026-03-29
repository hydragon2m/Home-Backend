import { Invitation } from '../entities/invitation.entity';

export interface IInvitationsRepository {
  findByCode(code: string): Promise<Invitation | null>;
  save(invitation: Partial<Invitation>): Promise<Invitation>;
}

export const INVITATIONS_REPOSITORY = 'IInvitationsRepository';
