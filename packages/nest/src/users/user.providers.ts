import { DataSource } from 'typeorm';
import { User } from './user.entity';
import { REPOSITORIES } from 'src/utils/constants';

export const userProviders = [
  {
    provide: REPOSITORIES.USER,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(User),
    inject: [REPOSITORIES.DB],
  },
];
