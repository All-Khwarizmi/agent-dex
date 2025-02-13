import { ApiProperty } from '@nestjs/swagger';
import { IsEthereumAddress, IsString, IsNotEmpty } from 'class-validator';

export class EventDTO {
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

  @ApiProperty({ description: 'Amount of token0 swapped' })
  amount0: number;

  @ApiProperty({ description: 'Amount of token1 swapped' })
  amount1: number;

  @ApiProperty({ description: 'Liquidity provider address' })
  liquidityProvider: string;
}
