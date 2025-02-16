import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { eventProviders } from './event.providers';
import { PoolsModule } from 'src/pools/pools.module';
import { LiquidityProviderModule } from 'src/liquidity-provider/liquidity-provider.module';
import { DatabaseModule } from 'src/config/database.module';
import { UsersModule } from 'src/users/users.module';
import { EventPoolService } from './event-pool.service';
import { EventGlobalService } from './event-global.service';

@Module({
  imports: [PoolsModule, LiquidityProviderModule, DatabaseModule, UsersModule],
  providers: [
    ...eventProviders,
    EventsService,
    EventPoolService,
    EventGlobalService,
  ],
  controllers: [EventsController],
})
export class EventsModule {}
