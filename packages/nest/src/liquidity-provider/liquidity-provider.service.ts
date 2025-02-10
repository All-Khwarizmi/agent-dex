import { Inject, Injectable } from '@nestjs/common';
import { LiquidityProvider } from 'src/entities/liquidityProvider.entity';
import { REPOSITORIES } from 'src/utils/constants';
import { Repository } from 'typeorm';

@Injectable()
export class LiquidityProviderService {
  constructor(
    @Inject(REPOSITORIES.LIQUIDITTY_PROVIDER)
    private liquidityProviderRepository: Repository<LiquidityProvider>,
  ) {}
  test() {
    console.log('test');
  }
}
