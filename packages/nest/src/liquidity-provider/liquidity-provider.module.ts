import { Module } from '@nestjs/common';
import { liquidityProviderProviders } from './liquiditiy-provider.providers';
import { DatabaseModule } from 'src/config/database.module';
import { LiquidityProviderService } from './liquidity-provider.service';
import { LiquidityProviderController } from './liquidity-provider.controller';

@Module({
  imports: [DatabaseModule],
  providers: [...liquidityProviderProviders, LiquidityProviderService],
  exports: [LiquidityProviderService],
  controllers: [LiquidityProviderController],
})
export class LiquidityProviderModule {}
