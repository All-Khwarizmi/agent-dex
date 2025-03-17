import { Pool } from 'pg';
import { ConfigService } from '@nestjs/config';

export const DATABASE_POOL = 'DATABASE_URL';

export const databasePoolFactory = async (configService: ConfigService) => {
  // Use DATABASE_URL environment variable if available
  const databaseUrl = configService.get<string>('DATABASE_URL');

  if (databaseUrl) {
    return new Pool({
      connectionString: databaseUrl,
    });
  }

  // Otherwise, use the default connection settings
  return new Pool({
    user: 'postgres',
    password: 'postgres',
    host: 'localhost',
    port: 5432,
    database: 'myapp',
    ssl: false,
  });
};
