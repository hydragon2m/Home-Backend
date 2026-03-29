import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invitation } from '../entities/invitation.entity';
import { IInvitationsRepository } from '../interfaces/invitations.repository.interface';

@Injectable()
export class InvitationsRepository implements IInvitationsRepository {
  constructor(
    @InjectRepository(Invitation)
    private readonly repository: Repository<Invitation>,
  ) {}

  async findByCode(code: string): Promise<Invitation | null> {
    return this.repository.findOne({
      where: { code, isActive: true },
      relations: ['organization'],
    });
  }

  async save(invitation: Partial<Invitation>): Promise<Invitation> {
    return this.repository.save(invitation);
  }
}
