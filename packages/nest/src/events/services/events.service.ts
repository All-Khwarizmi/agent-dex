import { Injectable, OnModuleInit } from '@nestjs/common';
import { createPublicClient, http, parseAbiItem } from 'viem';
import { EventType } from '../../entities/event.entity';
import { EVENT_NAMES } from 'src/utils/constants';
import { config } from 'dotenv';
import { PoolsService } from 'src/pools/pools.service';
import { EventsGlobalService } from './events-global.service';
import { EventsPoolService } from './events-pool.service';
config();

@Injectable()
export class EventsService implements OnModuleInit {
  private client;

  constructor(
    private poolsService: PoolsService,
    private eventGlobalService: EventsGlobalService,
    private eventPoolService: EventsPoolService,
  ) {
    this.client = createPublicClient({
      transport: http(process.env.RPC_URL),
    });
  }
  async onModuleInit() {
    console.log('Starting event watching service...');
    await this.watchFactoryEvents();
    await this.watchAlreadyCreatedPools();
  }
  /**
   * Watch for new pools
   *   - When a new pool is created,
   *     - Save the event to the database
   *     - Save the pool to the database
   *     - Start watching the pool's events
   *   
   … */
  private async watchFactoryEvents() {
    const factoryAddress = process.env.FACTORY_ADDRESS;
    console.log('Watching factory events for:', factoryAddress);

    // Watch for new pools
    await this.client.watchContractEvent({
      address: factoryAddress,
      abi: [
        parseAbiItem(
          'event PairCreated(address indexed token0,address indexed token1,address pair,uint poolCount)',
        ),
      ],
      eventName: EVENT_NAMES.PAIR_CREATED,
      onLogs: async (logs) => {
        for (const log of logs) {
          console.log('Received log:', log);

          try {
            const batchAsync = [
              // Save log to database
              this.eventGlobalService.router(EventType.PAIR_CREATED, log),

              // Save new pool to database
              this.poolsService.create({
                address: log.args.pair,
                token0: log.args.token0,
                token1: log.args.token1,
              }),
            ];

            const result = await Promise.allSettled(batchAsync);

            for (const r of result) {
              if (r.status === 'rejected') {
                console.error('Error creating pool:', r.reason);
              }
              console.log(r);
            }

            console.log('New pool created:', log.args.pair);

            // Start watching this pool's events
            await this.eventPoolService.watchPoolEvents(log.args.pair);
          } catch (error) {
            console.error('Error creating pool:', error);
          }
        }
      },
    });
  }

  private async watchAlreadyCreatedPools() {
    // Get all pools
    const pools = await this.poolsService.findAll();

    for (const pool of pools) {
      await this.eventPoolService.watchPoolEvents(pool.address);
    }
  }
}
