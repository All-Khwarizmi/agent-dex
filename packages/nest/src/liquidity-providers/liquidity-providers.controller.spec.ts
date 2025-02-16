import { Test, TestingModule } from '@nestjs/testing';
import { LiquidityProvidersController } from './liquidity-provider.controller';
import { UsersService } from '../users/users.service';
import { LiquidityProvidersService } from './liquidity-providers.service';
import { LiquidityProvider } from 'src/entities/liquidity-provider.entity';

describe('LiquidityProviderController', () => {
  let controller: LiquidityProvidersController;

  const lp: Omit<LiquidityProvider, 'user'>[] = [
    {
      id: 1,
      address: '0x123',
      totalShares: 100,
      poolLiquidity: {
        '0x123': 100,
      },

      created_at: new Date(),
    },
  ];
  const liquidityProviderService = {
    findOne: jest.fn(
      (id: number) =>
        new Promise((resolve) => {
          resolve(lp.find((lp) => lp.id === id));
        }),
    ),
    findAll: jest.fn(() => Promise.resolve(lp)),
    update: jest.fn(
      (id: number) =>
        new Promise((resolve) => {
          resolve(lp.find((lp) => lp.id === id));
        }),
    ),
    create: jest.fn(
      (createLiquidityProviderDto: LiquidityProvider) =>
        new Promise((resolve) => {
          const newLp = {
            ...createLiquidityProviderDto,
            id: lp.length + 1,
          };
          lp.push(newLp);
          resolve(lp[lp.length - 1]);
        }),
    ),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LiquidityProvidersController],
      providers: [
        {
          provide: LiquidityProvidersService,
          useValue: liquidityProviderService,
        },
      ],
    }).compile();

    controller = module.get<LiquidityProvidersController>(
      LiquidityProvidersController,
    );
  });
  describe('Initialization', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });
  });

  describe('FindAll', () => {
    it('Should return all liquidity providers', async () => {
      const result = await controller.findAll();
      expect(result).toEqual(lp);
    });
  });

  describe('FindOne', () => {
    it('Should return a liquidity provider', async () => {
      const result = await controller.findOne(1);
      expect(result).toEqual(lp[0]);
    });
    it('Should return undefined if liquidity provider not found', async () => {
      const result = await controller.findOne(2);
      console.log(result);
      expect(result).toBeUndefined();
    });
  });

  describe('Create', () => {
    it('Should create a liquidity provider', async () => {
      const newLp = {
        address: '0x123',
        totalShares: 100,
        poolLiquidity: {
          '0x123': 100,
        },
      };
      const result = await controller.create(newLp);
      expect(result).toEqual({ ...newLp, id: lp.length });
    });
  });

  describe('Update', () => {
    it('Should update a liquidity provider', async () => {
      const result = await controller.update('1', {
        address: '0x456',
        totalShares: 200,
        poolLiquidity: {
          '0x456': 200,
        },
      });
      expect(result).toEqual(lp[0]);
      expect(liquidityProviderService.update).toHaveBeenCalledWith(1, {
        address: '0x456',
        totalShares: 200,
        poolLiquidity: {
          '0x456': 200,
        },
      });
    });
  });
});
