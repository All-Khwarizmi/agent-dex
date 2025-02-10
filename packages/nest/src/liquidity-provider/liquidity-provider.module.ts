import { Module } from '@nestjs/common';
import { liquidityProviderProviders } from './liquiditiy-provider.providers';
import { DatabaseModule } from 'src/config/database.module';
import { LiquidityProviderService } from './liquidity-provider.service';

@Module({
  imports: [DatabaseModule],
  providers: [...liquidityProviderProviders, LiquidityProviderService],
  exports: [LiquidityProviderService],
})
export class LiquidityProviderModule {}
