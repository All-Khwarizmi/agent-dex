import { Test, TestingModule } from '@nestjs/testing';
import { LiquidityProvidersController } from './liquidity-provider.controller';
import { LiquidityProvidersService } from './liquidity-providers.service';
import { LiquidityProvider } from 'src/entities/liquidity-provider.entity';
import { NotFoundException } from '@nestjs/common';

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
    it('Should throw NotFoundException if liquidity provider not found', async () => {
      await expect(controller.findOne(2)).rejects.toThrow(NotFoundException);
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
});
