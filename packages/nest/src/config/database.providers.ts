import { ConfigService } from '@nestjs/config';
import { REPOSITORIES } from 'src/utils/constants';

import { DataSource } from 'typeorm';

export const databaseProviders = [
  {
    provide: REPOSITORIES.DB,
    inject: [ConfigService],
    useFactory: async (configService: ConfigService) => {
      const dataSource = new DataSource({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        // If no DATABASE_URL, use these defaults:
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USERNAME', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', 'postgres'),
        database: configService.get<string>('DB_NAME', 'myapp'),
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: process.env.NODE_ENV !== 'production', // Be careful with this in production
      });

      return dataSource.initialize();
    },
  },
];
