import { Test, TestingModule } from '@nestjs/testing';
import { LiquidityProviderController } from './liquidity-provider.controller';

describe('LiquidityProviderController', () => {
  let controller: LiquidityProviderController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LiquidityProviderController],
    }).compile();

    controller = module.get<LiquidityProviderController>(LiquidityProviderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
