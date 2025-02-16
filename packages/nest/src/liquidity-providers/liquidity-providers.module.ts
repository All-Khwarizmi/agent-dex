import { Module } from '@nestjs/common';
import { liquidityProvidersProviders } from './liquiditiy-providers.providers';
import { DatabaseModule } from 'src/config/database.module';
import { LiquidityProvidersService } from './liquidity-providers.service';
import { LiquidityProvidersController } from './liquidity-provider.controller';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [DatabaseModule, UsersModule],
  providers: [...liquidityProvidersProviders, LiquidityProvidersService],
  exports: [LiquidityProvidersService],
  controllers: [LiquidityProvidersController],
})
export class LiquidityProvidersModule {}
