import { LiquidityProvider } from 'src/entities/liquidity-provider.entity';
import { REPOSITORIES } from 'src/utils/constants';
import { DataSource } from 'typeorm';

export const liquidityProviderProviders = [
  {
    provide: REPOSITORIES.LIQUIDITY_PROVIDER,
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(LiquidityProvider),
    inject: [REPOSITORIES.DB],
  },
];
