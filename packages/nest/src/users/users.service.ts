import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';
import { DATABASE_POOL } from '../config/database.config';
import { CreateUserDto } from './users.controller';
import { DatabaseService } from 'src/config/database.service';

@Injectable()
export class UsersService {
  constructor(private readonly dbService: DatabaseService) {}

  async findAll() {
    const result = await this.dbService.query('SELECT * FROM users');
    return result.rows;
  }

  async findOne(id: number) {
    const result = await this.dbService.query(
      'SELECT * FROM users WHERE id = $1',
      [id],
    );
    return result.rows[0];
  }

  async create(createUserDto: CreateUserDto) {
    const result = await this.dbService.query(
      'INSERT INTO users (name, email, status) VALUES ($1, $2, $3) RETURNING *',
      [createUserDto.name, createUserDto.email, createUserDto.status],
    );
    return result.rows[0];
  }
}
