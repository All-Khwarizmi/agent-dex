import { Test, TestingModule } from '@nestjs/testing';
import { LiquidityProvidersService } from './liquidity-providers.service';

describe('LiquidityProviderService', () => {
  let service: LiquidityProvidersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LiquidityProvidersService],
    }).compile();

    service = module.get<LiquidityProvidersService>(LiquidityProvidersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
