import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { PoolsService } from './pools.service';
import { CreatePoolDto } from './pool.dto';
@ApiTags('pools')
@Controller('pools')
export class PoolsController {
  constructor(private readonly poolsService: PoolsService) {}

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les pools' })
  @ApiResponse({
    status: 200,
    description: 'Liste des pools récupérée avec succès.',
  })
  findAll() {
    return this.poolsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un pool par son ID' })
  @ApiResponse({ status: 200, description: 'Pool trouvé.' })
  @ApiResponse({ status: 404, description: 'Pool non trouvé.' })
  findOne(@Param('id') id: string) {
    return this.poolsService.findOne(+id);
  }

  @Post()
  @ApiOperation({ summary: 'Créer un nouveau pool' })
  @ApiResponse({ status: 201, description: 'Pool créé avec succès.' })
  @ApiResponse({ status: 400, description: 'Erreur de validation.' })
  async create(@Body() createPoolDto: CreatePoolDto) {
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
