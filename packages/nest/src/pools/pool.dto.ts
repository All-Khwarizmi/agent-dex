import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEthereumAddress, IsNotEmpty } from 'class-validator';
export class CreatePoolDto {
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

  @ApiProperty({ description: 'Reserve of token1 in wei' })
  reserve1: number;
}
