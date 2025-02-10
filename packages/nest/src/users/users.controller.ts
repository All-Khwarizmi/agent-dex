import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiProperty,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UserStatus } from 'src/entities/user.entity';

// DTO pour la documentation Swagger
export class CreateUserDto {
  @ApiProperty({ example: 'John Doe', description: "Nom de l'utilisateur" })
  name: string;

  @ApiProperty({
    example: '0x1de56cF322c53Bd91Fdc437196b4e8B74CB08fe3',
    description: "EVM Address de l'utilisateur",
  })
  address: string;

  @ApiProperty({
    example: 'john@example.com',
    description: "Email de l'utilisateur",
  })
  email: string;

  @ApiProperty({ example: 'active', enum: ['active', 'inactive', 'pending'] })
  status: UserStatus;
}

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les utilisateurs' })
  @ApiResponse({
    status: 200,
    description: 'Liste des utilisateurs récupérée avec succès.',
  })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un utilisateur par son ID' })
  @ApiResponse({ status: 200, description: 'Utilisateur trouvé.' })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé.' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Post()
  @ApiOperation({ summary: 'Créer un nouvel utilisateur' })
  @ApiResponse({ status: 201, description: 'Utilisateur créé avec succès.' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
}
