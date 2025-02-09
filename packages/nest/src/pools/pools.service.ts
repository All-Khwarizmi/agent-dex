import { Inject, Injectable } from '@nestjs/common';
import { REPOSITORIES } from 'src/utils/constants';
import { Repository } from 'typeorm';
import { Pool } from './pool.entity';

@Injectable()
export class PoolsService {
  constructor(
    @Inject(REPOSITORIES.POOL)
    private readonly poolRepository: Repository<Pool>,
  ) {}

  async findAll() {
    return this.poolRepository.find();
  }

  async findOne(id: number) {
    return this.poolRepository.findOne({ where: { id: id } });
  }

  async create(createPoolDto: any) {
    return this.poolRepository.create({
      address: createPoolDto.address,
      token0: createPoolDto.token0,
      token1: createPoolDto.token1,
      reserve0: createPoolDto.reserve0,
      reserve1: createPoolDto.reserve1,
    });
  }
}
