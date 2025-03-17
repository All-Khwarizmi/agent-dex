import { DataSource } from 'typeorm';
import { Event } from '../entities/event.entity';
import { REPOSITORIES } from 'src/utils/constants';

export const eventsProviders = [
  {
    provide: REPOSITORIES.EVENT,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Event),
    inject: [REPOSITORIES.DB],
  },
];
