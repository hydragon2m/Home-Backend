import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { NotesService } from './notes.service';
import { Note } from './entities/note.entity';
import { GetUser } from '../../common/decorators/get-user.decorator';

@Controller('organizations/:orgId/notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  findAll(@Param('orgId') orgId: string) {
    return this.notesService.findAllByOrg(orgId);
  }

  @Post()
  create(
    @Param('orgId') orgId: string,
    @GetUser('id') userId: string,
    @Body() data: Partial<Note>,
  ) {
    return this.notesService.create(orgId, userId, data);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.notesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: Partial<Note>) {
    return this.notesService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.notesService.remove(id);
  }

  @Patch(':id/move')
  move(
    @Param('id') id: string,
    @Body('parentId') parentId: string | null,
    @Body('position') position?: number,
  ) {
    return this.notesService.move(id, parentId, position);
  }
}
