import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Note } from '../entities/note.entity';

@Injectable()
export class NotesRepository {
  constructor(
    @InjectRepository(Note)
    private readonly repository: Repository<Note>,
  ) {}

  async findAllByOrg(orgId: string): Promise<Note[]> {
    return this.repository.find({
      where: { orgId },
      order: { position: 'ASC', createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Note> {
    return this.repository.findOne({ where: { id }, relations: ['children'] });
  }

  async save(note: Partial<Note>): Promise<Note> {
    return this.repository.save(note);
  }

  async remove(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async updatePosition(id: string, position: number): Promise<void> {
    await this.repository.update(id, { position });
  }
}
