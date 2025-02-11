import { Injectable, Inject } from '@nestjs/common';
import { CreateUserDto } from './users.controller';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
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

  async findByAddress(address: string) {
    return this.userRepository.findOne({ where: { address: address } });
  }

  async findOne(id: number) {
    return this.userRepository.findOne({ where: { id: id } });
  }

  async updateUserSwaps(address: string) {
    const user = await this.findByAddress(address);
    if (!user) {
      return this.create({ address, swaps: 1 });
    }
    return this.userRepository.update(user.id, { swaps: user.swaps + 1 });
  }

  async create(createUserDto: Partial<CreateUserDto>) {
    return this.userRepository.save(createUserDto);
  }
}
