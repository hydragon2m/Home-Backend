import { Injectable, NotFoundException } from '@nestjs/common';
import { NotesRepository } from './repositories/notes.repository';
import { Note } from './entities/note.entity';
import { ServiceResult } from '../../common/utils/service-result';

@Injectable()
export class NotesService {
  constructor(private readonly repository: NotesRepository) {}

  async findAllByOrg(orgId: string): Promise<ServiceResult<Note[]>> {
    const notes = await this.repository.findAllByOrg(orgId);
    return ServiceResult.success(notes, 'Lấy danh sách ghi chú thành công');
  }

  async findOne(id: string): Promise<ServiceResult<Note>> {
    const note = await this.repository.findOne(id);
    if (!note) throw new NotFoundException('Ghi chú không tồn tại');
    return ServiceResult.success(note, 'Lấy thông tin ghi chú thành công');
  }

  async create(orgId: string, userId: string, data: Partial<Note>): Promise<ServiceResult<Note>> {
    const note = await this.repository.save({
      ...data,
      orgId,
      userId,
    });
    return ServiceResult.success(note, 'Tạo ghi chú thành công');
  }

  async update(id: string, data: Partial<Note>): Promise<ServiceResult<Note>> {
    const existing = await this.repository.findOne(id);
    if (!existing) throw new NotFoundException('Ghi chú không tồn tại');
    
    const updated = await this.repository.save({ ...existing, ...data });
    return ServiceResult.success(updated, 'Cập nhật ghi chú thành công');
  }

  async remove(id: string): Promise<ServiceResult<void>> {
    const existing = await this.repository.findOne(id);
    if (!existing) throw new NotFoundException('Ghi chú không tồn tại');
    
    await this.repository.remove(id);
    return ServiceResult.success(undefined, 'Xóa ghi chú thành công');
  }

  async move(id: string, parentId: string | null, position?: number): Promise<ServiceResult<Note>> {
    const note = await this.repository.findOne(id);
    if (!note) throw new NotFoundException('Ghi chú không tồn tại');
    
    note.parentId = parentId;
    if (position !== undefined) note.position = position;
    
    const updated = await this.repository.save(note);
    return ServiceResult.success(updated, 'Di chuyển ghi chú thành công');
  }
}
