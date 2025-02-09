import { ApiProperty } from '@nestjs/swagger';

export class CreatePoolDto {
  @ApiProperty({ example: '0x123', description: 'Adresse du pool' })
  address: string;

  @ApiProperty({ example: '0x456', description: 'Adresse du token0' })
  token0: string;

  @ApiProperty({ example: '0x789', description: 'Adresse du token1' })
  token1: string;

  @ApiProperty({ example: '1000', description: 'Réserve du token0' })
  reserve0: string;

  @ApiProperty({ example: '2000', description: 'Réserve du token1' })
  reserve1: string;
}
