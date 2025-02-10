import { Module } from '@nestjs/common';
import { liquidityProviderProviders } from './liquiditiy-provider.providers';
import { DatabaseModule } from 'src/config/database.module';
import { LiquidityProviderService } from './liquidity-provider.service';
import { LiquidityProviderController } from './liquidity-provider.controller';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [DatabaseModule, UsersModule],
  providers: [...liquidityProviderProviders, LiquidityProviderService],
  exports: [LiquidityProviderService],
  controllers: [LiquidityProviderController],
})
export class LiquidityProviderModule {}
