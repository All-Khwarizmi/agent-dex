import { Injectable, Inject } from '@nestjs/common';
import { CreateUserDto } from './users.controller';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { REPOSITORIES } from 'src/utils/constants';

@Injectable()
export class UsersService {
  constructor(
    @Inject(REPOSITORIES.USER)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll() {
    return this.userRepository.find();
  }

  async findOne(id: number) {
    return this.userRepository.findOne({ where: { id: id } });
  }

  async create(createUserDto: CreateUserDto) {
    return this.userRepository.create({
      name: createUserDto.name,
      email: createUserDto.email,
    });
  }
}
