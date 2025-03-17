import { Test, TestingModule } from '@nestjs/testing';
import { PoolsController } from './pools.controller';
import { PoolsService } from './pools.service';
import { Pool } from 'src/entities/pool.entity';
import { CreatePoolDTO } from './types/pool.dto';

describe('PoolsController', () => {
  let controller: PoolsController;

  const mockPools: Pool[] = [
    {
      id: 1,
      created_at: new Date(),
      address: '0x123',
      token0: '0x456',
      token1: '0x789',
      reserve0: 100,
      reserve1: 200,
      swaps: 1000,
    },
  ];
  const mockPoolService = {
    findAll: jest.fn(() => Promise.resolve(mockPools)),
    create: jest.fn((pool: CreatePoolDTO) => {
      const newPool = {
        ...pool,
        id: mockPools.length + 1,
        created_at: new Date(),
      };
      mockPools.push(newPool);
      return Promise.resolve(newPool);
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PoolsController],
      providers: [
        {
          provide: PoolsService,
          useValue: mockPoolService,
        },
      ],
    }).compile();

    controller = module.get<PoolsController>(PoolsController);
  });

  describe('Initialization', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });
  });

  describe('GetPools', () => {
    it('Should return all pools', async () => {
      const result = await controller.findAll();
      expect(result).toEqual(mockPools);
    });
  });

  describe('CreatePool', () => {
    it('Should create a pool', async () => {
      const newPool = {
        address: '0x123',
        token0: '0x456',
        token1: '0x789',
        reserve0: 100,
        reserve1: 200,
        swaps: 1000,
      };
      const result = await controller.create(newPool);
      expect(result).toEqual(mockPools[mockPools.length - 1]);
    });
  });
});
