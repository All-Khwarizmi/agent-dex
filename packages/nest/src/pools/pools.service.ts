import { Inject, Injectable } from '@nestjs/common';
import { REPOSITORIES } from 'src/utils/constants';
import { Repository } from 'typeorm';
import { Pool } from '../entities/pool.entity';
import { CreatePoolDTO } from './pool.dto';
import { poolReservesSchema } from './pool.schema';

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

  async findByAddress(address: string) {
    return this.poolRepository.findOne({ where: { address: address } });
  }

  async updatePoolReserves(
    poolAddress: string,
    reserves: Pick<CreatePoolDTO, 'reserve0' | 'reserve1'>,
    burn = false,
    swap = false,
  ) {
    const pool = await this.findByAddress(poolAddress.toLowerCase());
    if (!pool) {
      throw new Error('Pool not found');
    }

    const reservesFromDbCheck = poolReservesSchema.safeParse({
      reserve0: pool.reserve0,
      reserve1: pool.reserve1,
    });
    const reservesFromLogCheck = poolReservesSchema.safeParse(reserves);
    if (!reservesFromDbCheck.success || !reservesFromLogCheck.success) {
      throw new Error('Invalid reserves');
    }
    const newReserves = {
      reserve0: burn
        ? pool.reserve0 - reserves.reserve0
        : pool.reserve0 + reserves.reserve0,
      reserve1: burn
        ? pool.reserve1 - reserves.reserve1
        : pool.reserve1 + reserves.reserve1,
      swaps: swap ? pool.swaps + 1 : pool.swaps,
    };

    console.log('Updating pool reserves', newReserves);

    return this.poolRepository.update(pool.id, newReserves);
  }

  async create(createPoolDto: Partial<CreatePoolDTO>) {
    const pool = this.poolRepository.create({
      address: createPoolDto.address.toLowerCase(),
      token0: createPoolDto.token0,
      token1: createPoolDto.token1,
      reserve0: createPoolDto.reserve0,
      reserve1: createPoolDto.reserve1,
    });
    return this.poolRepository.save(pool);
  }
}
