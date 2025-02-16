import { Inject, Injectable } from '@nestjs/common';
import { EventType } from 'src/entities/event.entity';
import { REPOSITORIES } from 'src/utils/constants';
import { Repository } from 'typeorm';
import { Event } from 'src/entities/event.entity';
import { fromBigIntToNumber } from 'src/utils/utilities/formatters';

@Injectable()
export class EventsGlobalService {
  constructor(
    @Inject(REPOSITORIES.EVENT)
    private eventRepository: Repository<Event>,
  ) {}

  public async router(eventType: EventType, log: any) {
    switch (eventType) {
      case EventType.PAIR_CREATED:
        return await this.handlePairCreated(log);
      case EventType.MINT:
        return await this.handleMintEvent(log);
      case EventType.BURN:
        return await this.handleBurnEvent(log);
      case EventType.SWAP:
        return await this.handleSwap(log);
      case EventType.SWAP_FORWARDED:
        return await this.handleSwapForwarded(log);
      default:
        //TODO: log error db
        console.error('Unknown event type:', eventType);
        break;
    }
  }

  private async handleMintEvent(log: any) {
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

  private async handleBurnEvent(log: any) {
    try {
      this.eventRepository.save({
        type: EventType.BURN,
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

  private async handleSwap(log: any) {
    try {
      this.eventRepository.save({
        type: EventType.SWAP,
        sender: log.args.sender,
        poolAddress: log.args.poolAddress,
        amount0: fromBigIntToNumber(log.args.amountIn),
        amount1: fromBigIntToNumber(log.args.amountOut),
        transactionHash: log.transactionHash,
        blockNumber: Number(log.blockNumber),
      });
    } catch (error) {
      console.error('Error creating pool:', error);
    }
  }
  private async handleSwapForwarded(log: any) {
    try {
      this.eventRepository.save({
        type: EventType.SWAP_FORWARDED,
        sender: log.args.user,
        poolAddress: log.address,
        amount0: fromBigIntToNumber(log.args.amountIn),
        amount1: fromBigIntToNumber(log.args.amountOut),
        transactionHash: log.transactionHash,
        blockNumber: Number(log.blockNumber),
      });
    } catch (error) {
      console.error('Error creating pool:', error);
    }
  }

  private async handlePairCreated(log: any) {
    try {
      this.eventRepository.save({
        type: EventType.PAIR_CREATED,
        sender: log.address,
        poolAddress: log.args.pair,
        token0: log.args.token0,
        token1: log.args.token1,
        transactionHash: log.transactionHash,
        blockNumber: Number(log.blockNumber),
      });
    } catch (error) {
      console.error('Error creating pool:', error);
    }
  }
}
