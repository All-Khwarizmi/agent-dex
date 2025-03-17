import { DataSource } from 'typeorm';
import { User } from '../entities/user.entity';
import { REPOSITORIES } from '../utils/constants';

export const userProviders = [
  {
    provide: REPOSITORIES.USER,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(User),
    inject: [REPOSITORIES.DB],
  },
];
