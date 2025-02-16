import { Test, TestingModule } from '@nestjs/testing';
import { LiquidityProvidersController } from './liquidity-provider.controller';

describe('LiquidityProviderController', () => {
  let controller: LiquidityProvidersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LiquidityProvidersController],
    }).compile();

    controller = module.get<LiquidityProvidersController>(
      LiquidityProvidersController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
