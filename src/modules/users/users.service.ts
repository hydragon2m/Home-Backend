import { Injectable, ConflictException, Inject } from '@nestjs/common';
import { User } from './entities/user.entity';
import { type IUsersRepository, USERS_REPOSITORY } from './interfaces/users.repository.interface';

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
}
