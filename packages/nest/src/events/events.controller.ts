import { Controller, Post, Body, Delete } from '@nestjs/common';
import { EventsService } from './events.service';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post('listen')
  startListening(@Body() body: { contractAddress: string }) {
    return this.eventsService.startListening(body.contractAddress);
  }

  @Delete('listen')
  stopListening() {
    return this.eventsService.stopListening();
  }
}
