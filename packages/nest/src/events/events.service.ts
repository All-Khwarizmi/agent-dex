import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { createPublicClient, http, parseAbiItem } from 'viem';
import { Event, EventType } from './event.entity';
import { REPOSITORIES } from 'src/utils/constants';
import { config } from 'dotenv';
config();
@Injectable()
export class EventsService {
  private client;
  private unwatch?: () => void;

  constructor(
    @Inject(REPOSITORIES.EVENT)
    private eventRepository: Repository<Event>,
  ) {
    this.client = createPublicClient({
      transport: http(process.env.RPC_URL),
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
