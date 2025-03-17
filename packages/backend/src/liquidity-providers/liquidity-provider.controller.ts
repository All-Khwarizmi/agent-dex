import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
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
    try {
      return this.liquidityProviderService.findAll();
    } catch (error) {
      console.log(error);
      throw new NotFoundException();
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a liquidity provider by ID' })
  @ApiResponse({ status: 200, description: 'Liquidity provider found.' })
  @ApiResponse({ status: 404, description: 'Liquidity provider not found.' })
  async findOne(@Param('id') id: number) {
    try {
      const found = await this.liquidityProviderService.findOne(id);
      if (!found) {
        throw new NotFoundException();
      }
      return found;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new NotFoundException();
    }
  }

  @Post()
  @ApiOperation({ summary: 'Create a new liquidity provider' })
  @ApiResponse({
    status: 201,
    description: 'Liquidity provider created successfully.',
  })
  create(@Body() createLiquidityProviderDto: Partial<LiquidityProvider>) {
    try {
      return this.liquidityProviderService.create(createLiquidityProviderDto);
    } catch (error) {
      console.log(error);
      throw new NotFoundException();
    }
  }
}
