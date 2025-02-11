import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiProperty,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UserStatus } from 'src/entities/user.entity';
import { LiquidityProvider } from 'src/entities/liquidityProvider.entity';

// DTO pour la documentation Swagger
export class CreateUserDto {
  @ApiProperty({ example: 'John Doe', description: 'User name' })
  name: string;

  @ApiProperty({
    example: '0x1de56cF322c53Bd91Fdc437196b4e8B74CB08fe3',
    description: 'EVM Address of the user',
  })
  address: string;
  @ApiProperty({
    example: {
      address: '0x1de56cF322c53Bd91Fdc437196b4e8B74CB08fe3',
      totalShares: '100',
    },
    description: "Link to the user's liquidity provider",
  })
  liquidityProvider: Partial<LiquidityProvider>;

  @ApiProperty({
    example: 'john@example.com',
    description: "User's email",
  })
  email: string;

  @ApiProperty({ description: 'Number of swaps' })
  swaps: number;

  @ApiProperty({ example: 'active', enum: ['active', 'inactive', 'pending'] })
  status: UserStatus;
}

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: 200,
    description: 'List of users fetched successfully.',
  })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiResponse({ status: 200, description: 'User found.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully.' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
}
