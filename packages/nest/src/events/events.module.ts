import { Module } from '@nestjs/common';
import { EventsService } from './services/events.service';
import { eventProviders } from './event.providers';
import { PoolsModule } from 'src/pools/pools.module';
import { LiquidityProviderModule } from 'src/liquidity-provider/liquidity-provider.module';
import { DatabaseModule } from 'src/config/database.module';
import { UsersModule } from 'src/users/users.module';
import { EventPoolService } from './services/event-pool.service';
import { EventGlobalService } from './services/event-global.service';

@Module({
  imports: [PoolsModule, LiquidityProviderModule, DatabaseModule, UsersModule],
  providers: [
    ...eventProviders,
    EventsService,
    EventPoolService,
    EventGlobalService,
  ],
})
export class EventsModule {}
