import { DataSource } from 'typeorm';
import { Pool } from '../entities/pool.entity';
import { REPOSITORIES } from 'src/utils/constants';

export const poolProviders = [
  {
    provide: REPOSITORIES.POOL,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Pool),
    inject: [REPOSITORIES.DB],
  },
];
