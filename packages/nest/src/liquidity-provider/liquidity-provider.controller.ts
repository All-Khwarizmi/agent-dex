import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { LiquidityProvider } from 'src/entities/liquidityProvider.entity';
import { LiquidityProviderService } from './liquidity-provider.service';

@Controller('liquidity-provider')
export class LiquidityProviderController {
  constructor(
    private readonly liquidityProviderService: LiquidityProviderService,
  ) {}

  @Get()
  findAll() {
    return this.liquidityProviderService.findAll();
  }

  @Get(':id')
  findOne(id: number) {
    return this.liquidityProviderService.findOne(id);
  }

  @Post()
  create(@Body() createLiquidityProviderDto: Partial<LiquidityProvider>) {
    console.log(createLiquidityProviderDto);
    return this.liquidityProviderService.create(createLiquidityProviderDto);
  }

  @Patch(':id')
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
