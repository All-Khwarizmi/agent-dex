import { DataSource } from 'typeorm';
import { Event } from './event.entity';
import { REPOSITORIES } from 'src/utils/constants';

export const eventProviders = [
  {
    provide: REPOSITORIES.EVENT,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Event),
    inject: [REPOSITORIES.DB],
  },
];
