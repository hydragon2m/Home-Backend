import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from '../entities/session.entity';
import { ISessionsRepository } from '../interfaces/sessions.repository.interface';

@Injectable()
export class SessionsRepository implements ISessionsRepository {
  constructor(
    @InjectRepository(Session)
    private readonly repository: Repository<Session>,
  ) {}

  async create(sessionData: Partial<Session>): Promise<Session> {
    const session = this.repository.create(sessionData);
    return this.repository.save(session);
  }

  async findByToken(token: string): Promise<Session | null> {
    return this.repository.findOne({ where: { refreshToken: token }, relations: ['user'] });
  }

  async deleteByToken(token: string): Promise<void> {
    await this.repository.delete({ refreshToken: token });
  }

  async deleteAllForUser(userId: string): Promise<void> {
    await this.repository.delete({ user: { id: userId } });
  }
}
