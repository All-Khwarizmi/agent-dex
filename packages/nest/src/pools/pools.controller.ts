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
  create(@Body() createPoolDto: CreatePoolDto) {
    return this.poolsService.create(createPoolDto);
  }
}
