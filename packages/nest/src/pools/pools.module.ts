import { Module } from '@nestjs/common';
import { PoolsService } from './pools.service';
import { PoolsController } from './pools.controller';
import { poolProviders } from './pools.providers';
import { DatabaseModule } from 'src/config/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [...poolProviders, PoolsService],
  controllers: [PoolsController],
  exports: [PoolsService],
})
export class PoolsModule {}
