import { Inject, Injectable } from '@nestjs/common';
import { EventType } from 'src/entities/event.entity';
import { LiquidityProvidersService } from 'src/liquidity-providers/liquidity-providers.service';
import { PoolsService } from 'src/pools/pools.service';
import { UsersService } from 'src/users/users.service';
import { EVENT_NAMES, REPOSITORIES } from 'src/utils/constants';
import { createPublicClient, http, parseAbiItem } from 'viem';
import { fromBigIntToNumber } from 'src/utils/utilities/formatters';
import { EventsGlobalService } from './events-global.service';

@Injectable()
export class EventsPoolService {
  private client;

  constructor(
    @Inject(REPOSITORIES.EVENT)
    private eventGlobalService: EventsGlobalService,
    private poolsService: PoolsService,
    private usersService: UsersService,
    private liquidityProviderService: LiquidityProvidersService,
  ) {
    this.client = createPublicClient({
      transport: http(process.env.RPC_URL),
    });
  }

  /**
   * Watch for events related to a specific pool
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
        parseAbiItem(
          'event SwapForwarded(address user,address tokenIn,address tokenOut,uint amountIn,uint amountOut)',
        ),
      ],
      eventNames: Object.values(EVENT_NAMES),
      onLogs: async (logs: any) => {
        for (const log of logs) {
          switch (log.eventName) {
            case EVENT_NAMES.MINT:
              await this.handleMintEvent(log);
              break;
            case EVENT_NAMES.BURN:
              await this.handleBurnEvent(log);
              break;
            case EVENT_NAMES.SWAP:
              await this.handleSwap(log);
              break;
            case EVENT_NAMES.SWAP_FORWARDED:
              await this.handleSwapForwarded(log);
              break;
          }
        }
      },
    });
  }

  private async handleMintEvent(log: any) {
    try {
      const asyncBatch = [
        // Save log to database
        this.eventGlobalService.router(EventType.MINT, log),

        //Update the liquidity provider's total shares
        this.liquidityProviderService.mint(
          log.args.sender,
          log.address,
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
    try {
      const asyncBatch = [
        await this.eventGlobalService.router(EventType.BURN, log),

        // Update the liquidity provider's total shares
        await this.liquidityProviderService.burn(
          log.args.sender,
          log.address,
          fromBigIntToNumber(log.args.burntLiquidity),
        ),

        // Update the pool's liquidity
        await this.poolsService.updatePoolReserves(
          log.address,
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
      // Save log and update user swaps
      const asyncBatch = [
        this.eventGlobalService.router(EventType.SWAP, log),
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
  private async handleSwapForwarded(log: any) {
    try {
      // Save log and update user swaps
      const asyncBatch = [
        this.eventGlobalService.router(EventType.SWAP_FORWARDED, log),
        this.usersService.updateUserSwaps(log.args.user),
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
