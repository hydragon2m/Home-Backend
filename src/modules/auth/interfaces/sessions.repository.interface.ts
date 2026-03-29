import { Session } from '../entities/session.entity';

export interface ISessionsRepository {
  create(sessionData: Partial<Session>): Promise<Session>;
  findByToken(token: string): Promise<Session | null>;
  deleteByToken(token: string): Promise<void>;
  deleteAllForUser(userId: string): Promise<void>;
}

export const SESSIONS_REPOSITORY = 'SESSIONS_REPOSITORY';
