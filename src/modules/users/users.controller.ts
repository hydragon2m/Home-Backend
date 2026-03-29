import { Controller, Get, Patch, Body, UseGuards, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getProfile(@GetUser('id') userId: string) {
    const user = await this.usersService.findById(userId);
    if (user) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  @Get(':id')
  async getPublicProfile(@Param('id') id: string) {
    return this.usersService.getPublicProfile(id);
  }

  @Patch('me')
  async updateProfile(
    @GetUser('id') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateProfile(userId, updateUserDto);
  }
}
