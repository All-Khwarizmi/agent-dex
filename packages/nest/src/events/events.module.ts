import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { eventProviders } from './event.providers';
import { PoolsModule } from 'src/pools/pools.module';
import { LiquidityProviderModule } from 'src/liquidity-provider/liquidity-provider.module';
import { DatabaseModule } from 'src/config/database.module';

@Module({
  imports: [PoolsModule, LiquidityProviderModule, DatabaseModule],
  providers: [...eventProviders, EventsService],
  controllers: [EventsController],
})
export class EventsModule {}
