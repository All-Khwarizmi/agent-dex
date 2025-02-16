import { Module } from '@nestjs/common';
import { EventsService } from './services/events.service';
import { eventsProviders } from './events.providers';
import { PoolsModule } from 'src/pools/pools.module';
import { LiquidityProvidersModule } from 'src/liquidity-providers/liquidity-providers.module';
import { DatabaseModule } from 'src/config/database.module';
import { UsersModule } from 'src/users/users.module';
import { EventsPoolService } from './services/events-pool.service';
import { EventsGlobalService } from './services/events-global.service';

@Module({
  imports: [PoolsModule, LiquidityProvidersModule, DatabaseModule, UsersModule],
  providers: [
    ...eventsProviders,
    EventsService,
    EventsPoolService,
    EventsGlobalService,
  ],
})
export class EventsModule {}
