import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User, UserStatus } from '../entities/user.entity';
import { NotFoundException } from '@nestjs/common';
import { CreateUserDTO } from './user.dto';

describe('UsersController', () => {
  let usersController: UsersController;

  const mockUsers: Omit<User, 'liquidityProvider' | 'created_at'>[] = [
    {
      id: 1,
      address: '0x123',
      swaps: 3,
      status: UserStatus.ACTIVE,
      name: 'John Doe',
      email: 'john@example.com',
    },
  ];

  const mockUsersService = {
    findAll: jest.fn().mockResolvedValue(mockUsers),
    findOne: jest.fn((id: number) => {
      const user = mockUsers.find((user) => user.id === id);
      if (!user) {
        throw new NotFoundException();
      }
      return Promise.resolve(user);
    }),
    create: jest.fn((user: CreateUserDTO) => {
      const newUser = {
        ...user,
        id: mockUsers.length + 1,
      };
      mockUsers.push(newUser);
      return Promise.resolve(mockUsers[mockUsers.length - 1]);
    }),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersService],
    })
      .overrideProvider(UsersService)
      .useValue(mockUsersService)
      .compile();

    usersController = module.get<UsersController>(UsersController);
  });

  describe('Initialization', () => {
    it('should be defined"', () => {
      expect(usersController).toBeDefined();
    });
  });

  describe('findAll', () => {
    it('should return an array of users"', async () => {
      expect(await usersController.findAll()).toEqual(mockUsers);
    });
  });

  describe('findOne', () => {
    it('should return a user"', async () => {
      expect(await usersController.findOne('1')).toEqual(mockUsers[0]);
    });

    it('should throw an error if the user does not exist"', async () => {
      await expect(usersController.findOne('100')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create a new user"', async () => {
      const createUserDto = {
        address: '0x123',
        swaps: 3,
        status: UserStatus.ACTIVE,
        liquidityProvider: {},
        name: 'John Doe',
        email: 'john@example.com',
      };
      expect(await usersController.create(createUserDto)).toEqual({
        ...createUserDto,
        id: mockUsers.length,
      });
    });
  });
});
