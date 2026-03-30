import { Session } from '../entities/session.entity';

export interface ISessionsRepository {
  create(sessionData: Partial<Session>): Promise<Session>;
  findById(id: string): Promise<Session | null>;
  findByToken(token: string): Promise<Session | null>;
  deleteByToken(token: string): Promise<void>;
  deleteById(id: string): Promise<void>;
  deleteAllForUser(userId: string): Promise<void>;
}

export const SESSIONS_REPOSITORY = 'SESSIONS_REPOSITORY';
