import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEthereumAddress, IsNotEmpty } from 'class-validator';
import { poolSchema } from './pool.schema';
import { Pool } from 'src/entities/pool.entity';
export class CreatePoolDTO {
  @ApiProperty({ example: '0x123', description: 'Adresse du pool' })
  @IsEthereumAddress()
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ example: '0x456', description: 'Adresse du token0' })
  @IsEthereumAddress()
  @IsString()
  @IsNotEmpty()
  token0: string;

  @ApiProperty({ example: '0x789', description: 'Adresse du token1' })
  @IsEthereumAddress()
  @IsString()
  @IsNotEmpty()
  token1: string;

  @ApiProperty({ description: 'Reserve of token0 in wei' })
  reserve0: number;

  @ApiProperty({ description: 'Number of swaps' })
  swaps: number;

  @ApiProperty({ description: 'Reserve of token1 in wei' })
  reserve1: number;
}

export class PoolDTO {
  static from(pool: any): Pool {
    const isValidPool = poolSchema.safeParse({
      ...pool,
      reserve0: Number(pool.reserve0),
      reserve1: Number(pool.reserve1),
      swaps: Number(pool.swaps),
    });
    if (!isValidPool.success) {
      throw new Error(isValidPool.error.message);
    }
    return {
      address: isValidPool.data.address,
      token0: isValidPool.data.token0,
      token1: isValidPool.data.token1,
      reserve0: Number(isValidPool.data.reserve0),
      reserve1: Number(isValidPool.data.reserve1),
      swaps: Number(isValidPool.data.swaps),
      created_at: isValidPool.data.created_at,
      id: isValidPool.data.id,
    };
  }
}
