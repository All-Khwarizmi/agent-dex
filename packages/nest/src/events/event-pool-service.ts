import { Inject, Injectable } from '@nestjs/common';
import { EventType } from 'src/entities/event.entity';
import { LiquidityProviderService } from 'src/liquidity-provider/liquidity-provider.service';
import { PoolsService } from 'src/pools/pools.service';
import { UsersService } from 'src/users/users.service';
import { REPOSITORIES } from 'src/utils/constants';
import { Repository } from 'typeorm';
import { Event } from 'src/entities/event.entity';
import { createPublicClient, http, parseAbiItem } from 'viem';
import { fromBigIntToNumber } from 'src/utils/utilities/formatters';

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
          'event Swap(address indexed sender, address tokenIn, address tokenOut, uint amountIn, uint amountOut)',
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
              await this.handleBurnEvent(log);
              break;
            case 'Swap':
              await this.handleSwap(log);
              break;
          }
        }
      },
    });
  }

  private async handleMintEvent(log: any) {
    console.log('Received mint event', log);
    try {
      //TODO: refactor this into a method: (EventStoreService)
      // Save log to database
      const event = this.eventRepository.create({
        type: EventType.MINT,
        sender: log.args.sender,
        poolAddress: log.address,
        amount0: log.args.amount0,
        amount1: log.args.amount1,
        transactionHash: log.transactionHash,
        blockNumber: Number(log.blockNumber),
      });
      console.log(event);

      const asyncBatch = [
        this.eventRepository.save(event),

        //Update the liquidity provider's total shares
        this.liquidityProviderService.mint(
          event.sender,
          event.poolAddress,
          fromBigIntToNumber(log.args.mintedLiquidity),
        ),

        // Update the pool's liquidity
        this.poolsService.updatePoolReserves(log.address, {
          reserve0: fromBigIntToNumber(log.args.amount0),
          reserve1: fromBigIntToNumber(log.args.amount1),
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

  private async handleBurnEvent(log: any) {
    console.log('Received burn event', log);
    try {
      //TODO: refactor this into a method: (EventStoreService)
      // Save log to database
      const event = this.eventRepository.create({
        type: EventType.BURN,
        sender: log.args.sender,
        poolAddress: log.address,
        amount0: fromBigIntToNumber(log.args.amount0),
        amount1: fromBigIntToNumber(log.args.amount1),
        transactionHash: log.transactionHash,
        blockNumber: Number(log.blockNumber),
      });

      const asyncBatch = [
        await this.eventRepository.save(event),

        // Update the liquidity provider's total shares
        await this.liquidityProviderService.burn(
          event.sender,
          event.poolAddress,
          fromBigIntToNumber(log.args.burntLiquidity),
        ),

        // Update the pool's liquidity
        await this.poolsService.updatePoolReserves(
          event.poolAddress,
          {
            reserve0: fromBigIntToNumber(log.args.amount0),
            reserve1: fromBigIntToNumber(log.args.amount1),
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

  private async handleSwap(log: any) {
    try {
      console.log('Received swap event', log);

      // Save log and update user swaps
      const asyncBatch = [
        this.eventRepository.create({
          type: EventType.SWAP,
          sender: log.args.sender,
          poolAddress: log.args.poolAddress,
          amount0: fromBigIntToNumber(log.args.amount0),
          amount1: fromBigIntToNumber(log.args.amount1),
          transactionHash: log.transactionHash,
          blockNumber: Number(log.blockNumber),
        }),
        this.usersService.updateUserSwaps(log.args.sender),
      ];

      const result = await Promise.allSettled(asyncBatch);
      for (const r of result) {
        if (r.status === 'rejected') {
          console.error('Error creating pool:', r.reason);
        }
      }

      // Update the pool's liquidity
      const [_reserve0, _reserve1] = await this.client.readContract({
        address: log.address,
        abi: [
          parseAbiItem(
            'function getReserves() external view returns (uint256 _reserve0, uint256 _reserve1)',
          ),
        ],
        functionName: 'getReserves',
      });

      await this.poolsService.updatePoolReserves(
        log.address,
        {
          reserve0: fromBigIntToNumber(_reserve0),
          reserve1: fromBigIntToNumber(_reserve1),
        },
        false,
        true,
      );
    } catch (error) {
      console.error('Error handling swap:', error);
    }
  }
}
