import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as path from 'path';
import { DatabaseModule } from './config/database.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PoolsModule } from './pools/pools.module';
import { EventsModule } from './events/events.module';
import { LiquidityProvidersModule } from './liquidity-providers/liquidity-providers.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: path.resolve(process.cwd(), '.env.local'),
    }),
    DatabaseModule,
    UsersModule,
    PoolsModule,
    EventsModule,
    LiquidityProvidersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
