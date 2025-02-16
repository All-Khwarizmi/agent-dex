import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { REPOSITORIES } from '../utils/constants';
import { CreateUserDTO } from './user.dto';
import { formatNumber } from '../utils/utilities/format-number';

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
    const user = await this.findByAddress(address.toLowerCase());
    if (!user) {
      return this.create({ address, swaps: 1 });
    }
    return this.userRepository.update(user.id, {
      swaps: formatNumber(user.swaps) + 1,
    });
  }

  async create(createUserDto: Partial<CreateUserDTO>) {
    return this.userRepository.save({
      ...createUserDto,
      address: createUserDto.address.toLowerCase(),
    });
  }
}
