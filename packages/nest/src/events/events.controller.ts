import { Controller, Post, Body, Delete, Get } from '@nestjs/common';
import { EventsService } from './events.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { EventDTO } from './event.dto';

@ApiTags('events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all events' })
  @ApiResponse({
    status: 200,
    description: 'List of events fetched successfully.',
    type: EventDTO,
    isArray: true,
  })
  async getEvents() {
    // return this.eventsService.watchPoolEvents();
  }

  @Post('listen')
  startListening(@Body() body: { contractAddress: string }) {
    return this.eventsService.startListening(body.contractAddress);
  }

  @Delete('listen')
  stopListening() {
    return this.eventsService.stopListening();
  }
}
