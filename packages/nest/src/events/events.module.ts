import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { eventProviders } from './event.providers';
import { DatabaseModule } from 'src/config/database.module';
import { poolProviders } from 'src/pools/pool.providers';

@Module({
  imports: [DatabaseModule],
  providers: [...eventProviders, ...poolProviders, EventsService],
  controllers: [EventsController],
})
export class EventsModule {}
