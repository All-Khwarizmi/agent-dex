import { Inject, Injectable } from '@nestjs/common';
import { REPOSITORIES } from 'src/utils/constants';
import { Repository } from 'typeorm';
import { Pool } from './pool.entity';
import { CreatePoolDto } from './pool.dto';

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

  async create(createPoolDto: CreatePoolDto) {
    const pool = this.poolRepository.create({
      address: createPoolDto.address,
      token0: createPoolDto.token0,
      token1: createPoolDto.token1,
      reserve0: createPoolDto.reserve0,
      reserve1: createPoolDto.reserve1,
    });
    return this.poolRepository.save(pool);
  }
}
