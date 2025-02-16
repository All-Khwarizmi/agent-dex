import { Inject, Injectable } from '@nestjs/common';
import { EventType } from 'src/entities/event.entity';
import { REPOSITORIES } from 'src/utils/constants';
import { Repository } from 'typeorm';
import { Event } from 'src/entities/event.entity';

@Injectable()
export class EventGlobalService {
  constructor(
    @Inject(REPOSITORIES.EVENT)
    private eventRepository: Repository<Event>,
  ) {}

  public async router(eventType: EventType, log: any) {
    // Switch on the event type
    switch (eventType) {
      case EventType.MINT:
        // Mint event
        return await this.handleMintEvent(log);
      case EventType.BURN:
        // Burn event
        // await this.handleBurnEvent(log);
        break;
      case EventType.SWAP:
        // Swap event
        // await this.handleSwap(log);
        break;
      case EventType.SWAP_FORWARDED:
        // Swap forwarded event
        // await this.handleSwapForwarded(log);
        break;
      default:
        // Unknown event type
        console.error('Unknown event type:', eventType);
        break;
    }
  }

  private async handleMintEvent(log: any) {
    console.log('Received mint event', log);
    try {
      this.eventRepository.save({
        type: EventType.MINT,
        sender: log.args.sender,
        poolAddress: log.address,
        amount0: log.args.amount0,
        amount1: log.args.amount1,
        transactionHash: log.transactionHash,
        blockNumber: Number(log.blockNumber),
      });
    } catch (error) {
      console.error('Error creating pool:', error);
    }
  }
}
