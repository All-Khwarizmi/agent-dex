import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { DatabaseModule } from '../config/database.module';
import { userProviders } from './user.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [UsersController],
  providers: [...userProviders, UsersService],
})
export class UsersModule {}
