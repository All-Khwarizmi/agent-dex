import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { DATABASE_POOL } from './database.config';

@Injectable()
export class DatabaseService {
  constructor(@Inject(DATABASE_POOL) private pool: Pool) {}

  async query(text: string, params?: any[]) {
    const client = await this.pool.connect();
    try {
      return await client.query(text, params);
    } finally {
      client.release();
    }
  }
}
