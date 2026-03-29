import { Injectable, ConflictException, Inject, NotFoundException } from '@nestjs/common';
import { User } from './entities/user.entity';
import { type IUsersRepository, USERS_REPOSITORY } from './interfaces/users.repository.interface';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: IUsersRepository,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findByEmail(email);
  }

  async create(userData: Partial<User>): Promise<User> {
    if (!userData.email) {
      throw new ConflictException('Email là bắt buộc');
    }
    const existingUser = await this.findByEmail(userData.email);
    if (existingUser) {
      throw new ConflictException('Email đã tồn tại trong hệ thống');
    }
    return this.usersRepository.create(userData);
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findById(id);
  }

  async getPublicProfile(id: string): Promise<Partial<User>> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }
    // Chỉ trả về các thông tin an toàn (bỏ qua email, password, sđt)
    const { id: userId, name, avatar, bio, createdAt } = user;
    return { id: userId, name, avatar, bio, createdAt };
  }

  async updateProfile(id: string, updateData: UpdateUserDto): Promise<Partial<User>> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    Object.assign(user, updateData);
    const updatedUser = await this.usersRepository.create(user);
    
    // Loại bỏ password trước khi trả về
    const { password, ...result } = updatedUser;
    return result;
  }
}
