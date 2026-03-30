import { Controller, Get, Patch, Body, UseGuards, Param, NotFoundException } from '@nestjs/common';
import { ServiceResult } from '../../common/utils/service-result';
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
    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }
    const { password, ...result } = user;
    return ServiceResult.success(result, 'Lấy hồ sơ cá nhân thành công');
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
