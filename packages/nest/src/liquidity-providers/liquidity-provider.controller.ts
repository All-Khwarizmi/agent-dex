import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { LiquidityProvider } from 'src/entities/liquidity-provider.entity';
import { LiquidityProvidersService } from './liquidity-providers.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('liquidity-provider')
export class LiquidityProvidersController {
  constructor(
    private readonly liquidityProviderService: LiquidityProvidersService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all liquidity providers' })
  @ApiResponse({
    status: 200,
    description: 'List of liquidity providers fetched successfully.',
  })
  findAll() {
    return this.liquidityProviderService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a liquidity provider by ID' })
  @ApiResponse({ status: 200, description: 'Liquidity provider found.' })
  @ApiResponse({ status: 404, description: 'Liquidity provider not found.' })
  findOne(id: number) {
    return this.liquidityProviderService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new liquidity provider' })
  @ApiResponse({
    status: 201,
    description: 'Liquidity provider created successfully.',
  })
  create(@Body() createLiquidityProviderDto: Partial<LiquidityProvider>) {
    return this.liquidityProviderService.create(createLiquidityProviderDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a liquidity provider' })
  @ApiResponse({
    status: 200,
    description: 'Liquidity provider updated successfully.',
  })
  update(
    @Param('id') id: string,
    @Body() updateLiquidityProviderDto: Partial<LiquidityProvider>,
  ) {
    return this.liquidityProviderService.update(
      Number(id),
      updateLiquidityProviderDto,
    );
  }
}
