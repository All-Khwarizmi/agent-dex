import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { PoolsService } from './pools.service';
import { CreatePoolDTO } from './types/pool.dto';
import { Pool } from '../entities/pool.entity';
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
    try {
      return this.poolsService.findAll();
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a pool by ID' })
  @ApiResponse({
    status: 200,
    description: 'Pool found.',
    type: Pool,
    example: Pool,
  })
  @ApiResponse({ status: 404, description: 'Pool not found.' })
  findOne(@Param('id') id: string) {
    try {
      return this.poolsService.findOne(+id);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  @Post()
  @ApiOperation({ summary: 'Create a new pool' })
  @ApiResponse({ status: 201, description: 'Pool created successfully.' })
  @ApiResponse({ status: 400, description: 'Validation error.' })
  async create(@Body() createPoolDto: CreatePoolDTO) {
    try {
      return this.poolsService.create(createPoolDto);
    } catch (error) {
      console.log(error);
      return { error: error.message };
    }
  }
}
