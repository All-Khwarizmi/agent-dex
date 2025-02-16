import { LiquidityProvider } from '../entities/liquidity-provider.entity';
import { REPOSITORIES } from '../utils/constants';
import { DataSource } from 'typeorm';

export const liquidityProvidersProviders = [
  {
    provide: REPOSITORIES.LIQUIDITY_PROVIDER,
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(LiquidityProvider),
    inject: [REPOSITORIES.DB],
  },
];
