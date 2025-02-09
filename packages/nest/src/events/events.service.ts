import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { createPublicClient, http, parseAbiItem } from 'viem';
import { Event, EventType } from './event.entity';
import { REPOSITORIES } from 'src/utils/constants';
import { config } from 'dotenv';
import { Pool } from 'src/pools/pool.entity';
config();
@Injectable()
export class EventsService implements OnModuleInit {
  private client;
  private unwatch?: () => void;

  constructor(
    @Inject(REPOSITORIES.EVENT)
    private eventRepository: Repository<Event>,
    @Inject(REPOSITORIES.POOL)
    private poolsService: Repository<Pool>,
  ) {
    this.client = createPublicClient({
      transport: http(process.env.RPC_URL),
    });
  }
  async onModuleInit() {
    console.log('Starting event watching service...');
    await this.startWatching();
  }

  private async startWatching() {
    // First listen to Factory events
    await this.watchFactoryEvents();
  }

  private async watchFactoryEvents() {
    const factoryAddress = process.env.FACTORY_ADDRESS;

    // Watch for new pools
    await this.client.watchContractEvent({
      address: factoryAddress,
      abi: [
        parseAbiItem(
          'event PairCreated(address indexed token0,address indexed token1,address pair,uint)',
        ),
      ],
      onLogs: async (logs) => {
        for (const log of logs) {
          // Save new pool to database
          const poolAddress = log.args.pool;
          const pool = this.poolsService.create({
            address: poolAddress,
            token0: log.args.tokenA,
            token1: log.args.tokenB,
          });

          await this.poolsService.save(pool);

          // Start watching this pool's events
          await this.watchPoolEvents(poolAddress);
        }
      },
    });
  }

  private async watchPoolEvents(poolAddress: string) {
    console.log('Watching pool events for:', poolAddress);
    await this.client.watchContractEvent({
      address: poolAddress,
      abi: [
        parseAbiItem(
          'event Mint(address indexed sender, uint amount0, uint amount1)',
        ),
        parseAbiItem(
          'event Burn(address indexed sender, uint amount0, uint amount1, address indexed to)',
        ),
        parseAbiItem(
          'event Swap(address indexed sender, uint amountIn, uint amountOut)',
        ),
        // ... other pool events
      ],
      onLogs: async (logs) => {
        for (const log of logs) {
          // await this.handlePoolEvent(log);

          console.log('Received log:', log);
        }
      },
    });
  }
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

  stopListening() {
    if (this.unwatch) {
      this.unwatch();
      return { message: 'Stopped listening to events' };
    }
    return { message: 'No active listener to stop' };
  }
}
