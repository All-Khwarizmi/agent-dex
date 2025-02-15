import { UserStatus } from 'src/entities/user.entity';
import { LiquidityProvider } from 'src/entities/liquidity-provider.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDTO {
  @ApiProperty({ example: 'John Doe', description: 'User name' })
  name: string;

  @ApiProperty({
    example: '0x1de56cF322c53Bd91Fdc437196b4e8B74CB08fe3',
    description: 'EVM Address of the user',
  })
  address: string;
  @ApiProperty({
    example: {
      address: '0x1de56cF322c53Bd91Fdc437196b4e8B74CB08fe3',
      totalShares: '100',
    },
    description: "Link to the user's liquidity provider",
  })
  liquidityProvider: Partial<LiquidityProvider>;

  @ApiProperty({
    example: 'john@example.com',
    description: "User's email",
  })
  email: string;

  @ApiProperty({ description: 'Number of swaps' })
  swaps: number;

  @ApiProperty({ example: 'active', enum: ['active', 'inactive', 'pending'] })
  status: UserStatus;
}
