import { Inject, Injectable } from '@nestjs/common';
import { EventType } from 'src/entities/event.entity';
import { LiquidityProviderService } from 'src/liquidity-provider/liquidity-provider.service';
import { PoolsService } from 'src/pools/pools.service';
import { UsersService } from 'src/users/users.service';
import { REPOSITORIES } from 'src/utils/constants';
import { Repository } from 'typeorm';
import { Event } from 'src/entities/event.entity';
import { createPublicClient, http, parseAbiItem } from 'viem';

@Injectable()
export class EventPoolService {
  private client;

  constructor(
    @Inject(REPOSITORIES.EVENT)
    private eventRepository: Repository<Event>,
    private poolsService: PoolsService,
    private usersService: UsersService,
    private liquidityProviderService: LiquidityProviderService,
  ) {
    this.client = createPublicClient({
      transport: http(process.env.RPC_URL),
    });
  }

  /**
   * Watch for events related to a specific pool
   *   - When a new mint event is received,
   *     - Save the event to the database
   *   - When a new burn event is received,
   *     - Save the event to the database
   *   - When a new swap event is received,
   *     - Save the event to the database
   *   - When a new swap forwarded event is received,
   *     - Save the event to the database
   *   - When a new investment event is received,
   *     - Save the event to the database
   *   - When a new divestment event is received,
   *     - Save the event to the database
   *   
   … */
  async watchPoolEvents(poolAddress: string) {
    console.log('Watching pool events for:', poolAddress);
    await this.client.watchContractEvent({
      address: poolAddress,
      abi: [
        parseAbiItem(
          'event Mint(address indexed sender, uint amount0, uint amount1, uint mintedLiquidity)',
        ),
        parseAbiItem(
          'event Burn(address indexed sender, uint amount0, uint amount1, address indexed to, uint burntLiquidity)',
        ),
        parseAbiItem(
          'event Swap(address indexed sender, uint amountIn, uint amountOut)',
        ),
      ],
      eventNames: ['Mint', 'Burn', 'Swap'],
      onLogs: async (logs: any) => {
        for (const log of logs) {
          // await this.handlePoolEvent(log);
          //TODO
          switch (log.eventName) {
            case 'Mint':
              await this.handleMintEvent(log);
              break;
            case 'Burn':
              // await this.handleBurnEvent(log);
              break;
          }
        }
      },
    });
  }

  async handleMintEvent(log: any) {
    console.log('Received mint event', log);
    try {
      //TODO: refactor this into a method: (EventStoreService)
      // Save log to database
      const event = this.eventRepository.create({
        type: EventType.MINT,
        sender: log.args.sender,
        poolAddress: log.address,
        amount0: log.args.amount0.toString(),
        amount1: log.args.amount1.toString(),
        transactionHash: log.transactionHash,
        blockNumber: Number(log.blockNumber),
      });

      const asyncBatch = [
        await this.eventRepository.save(event),

        // Update the liquidity provider's total shares
        await this.liquidityProviderService.mint(
          event.sender,
          event.poolAddress,
          log.args.mintedLiquidity.toString(),
        ),

        // Update the pool's liquidity
        await this.poolsService.updatePoolReserves(event.poolAddress, {
          reserve0: log.args.amount0.toString(),
          reserve1: log.args.amount1.toString(),
        }),
      ];

      const result = await Promise.allSettled(asyncBatch);
      for (const r of result) {
        if (r.status === 'rejected') {
          console.error('Error creating pool:', r.reason);
        }
      }
    } catch (error) {
      console.error('Error creating pool:', error);
    }
  }

  async handleBurnEvent(log: any) {
    console.log('Received burn event', log);
    try {
      //TODO: refactor this into a method: (EventStoreService)
      // Save log to database
      const event = this.eventRepository.create({
        type: EventType.BURN,
        sender: log.args.sender,
        poolAddress: log.address,
        amount0: log.args.amount0.toString(),
        amount1: log.args.amount1.toString(),
        transactionHash: log.transactionHash,
        blockNumber: Number(log.blockNumber),
      });

      const asyncBatch = [
        await this.eventRepository.save(event),

        // Update the liquidity provider's total shares
        await this.liquidityProviderService.burn(
          event.sender,
          event.poolAddress,
          log.args.burntLiquidity.toString(),
        ),

        // Update the pool's liquidity
        await this.poolsService.updatePoolReserves(
          event.poolAddress,
          {
            reserve0: log.args.amount0.toString(),
            reserve1: log.args.amount1.toString(),
          },
          true,
        ),
      ];

      const result = await Promise.allSettled(asyncBatch);
      for (const r of result) {
        if (r.status === 'rejected') {
          console.error('Error creating pool:', r.reason);
        }
      }
    } catch (error) {
      console.error('Error creating pool:', error);
    }
  }
}
