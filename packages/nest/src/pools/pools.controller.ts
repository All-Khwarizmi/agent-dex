import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { PoolsService } from './pools.service';
import { CreatePoolDTO } from './types/pool.dto';
@ApiTags('pools')
@Controller('pools')
export class PoolsController {
  constructor(private readonly poolsService: PoolsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all pools' })
  @ApiResponse({
    status: 200,
    description: '  List of pools fetched successfully.',
  })
  findAll() {
    return this.poolsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a pool by ID' })
  @ApiResponse({ status: 200, description: 'Pool found.' })
  @ApiResponse({ status: 404, description: 'Pool not found.' })
  findOne(@Param('id') id: string) {
    return this.poolsService.findOne(+id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new pool' })
  @ApiResponse({ status: 201, description: 'Pool created successfully.' })
  @ApiResponse({ status: 400, description: 'Validation error.' })
  async create(@Body() createPoolDto: CreatePoolDTO) {
    try {
      console.log(createPoolDto);
      const pool = await this.poolsService.create(createPoolDto);
      console.log(pool);
      return pool;
    } catch (error) {
      console.log(error);
      return { error: error.message };
    }
  }
}
