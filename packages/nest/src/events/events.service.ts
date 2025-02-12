import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { createPublicClient, http, parseAbiItem } from 'viem';
import { Event, EventType } from '../entities/event.entity';
import { REPOSITORIES } from 'src/utils/constants';
import { config } from 'dotenv';
import { LiquidityProviderService } from 'src/liquidity-provider/liquidity-provider.service';
import { PoolsService } from 'src/pools/pools.service';
import { UsersService } from 'src/users/users.service';
import { EventPoolService } from './event-pool-service';
config();

@Injectable()
export class EventsService implements OnModuleInit {
  private client;
  private unwatch?: () => void;

  constructor(
    @Inject(REPOSITORIES.EVENT)
    private eventRepository: Repository<Event>,
    private poolsService: PoolsService,
    private usersService: UsersService,
    private liquidityProviderService: LiquidityProviderService,
    private eventPoolService: EventPoolService,
  ) {
    this.client = createPublicClient({
      transport: http(process.env.RPC_URL),
    });
  }
  async onModuleInit() {
    console.log('Starting event watching service...');
    await this.watchFactoryEvents();
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
      eventName: 'PairCreated',
      onLogs: async (logs) => {
        for (const log of logs) {
          console.log('Received log:', log);

          try {
            //TODO: refactor this into a method
            // Save log to database
            const event = this.eventRepository.create({
              type: EventType.PAIR_CREATED,
              sender: log.address,
              poolAddress: log.args.pair,
              token0: log.args.token0,
              token1: log.args.token1,
              transactionHash: log.transactionHash,
              blockNumber: Number(log.blockNumber),
            });

            await this.eventRepository.save(event);

            //TODO: refactor this into a method
            // Save new pool to database
            const poolAddress = log.args.pair;
            const pool = await this.poolsService.create({
              address: poolAddress,
              token0: log.args.token0,
              token1: log.args.token1,
            });

            console.log('New pool created:', pool);

            // Start watching this pool's events
            await this.eventPoolService.watchPoolEvents(poolAddress);
          } catch (error) {
            console.error('Error creating pool:', error);
          }
        }
      },
    });
  }

  /**
   * Start listening to events
   *   - When a new mint event is received,
   *     - Save the event to the database
   * */
  async startListening(contractAddress: string) {
    try {
      console.log('Starting to listen to events...');

      this.unwatch = await this.client.watchContractEvent({
        address: contractAddress,
        abi: [
          parseAbiItem(
            'event Mint(address indexed sender, uint amount0, uint amount1)',
          ),
        ],
        eventName: 'Mint',
        onLogs: async (logs) => {
          console.log('Received logs:', logs);

          for (const log of logs) {
            await this.eventRepository.save({
              type: EventType.MINT,
              sender: log.args.sender,
              poolAddress: log.address,
              amount0: log.args.amount0.toString(),
              amount1: log.args.amount1.toString(),
              transactionHash: log.transactionHash,
              blockNumber: Number(log.blockNumber),
            });
          }
        },
      });

      return { message: 'Started listening to events' };
    } catch (error) {
      console.error('Error starting listener:', error);
      throw error;
    }
  }

  /**
   * Stop listening to events
   *
   * */
  stopListening() {
    if (this.unwatch) {
      this.unwatch();
      return { message: 'Stopped listening to events' };
    }
    return { message: 'No active listener to stop' };
  }
}
