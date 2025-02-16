import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, NotFoundException } from '@nestjs/common';
import * as request from 'supertest';
import { LiquidityProvidersModule } from '../src/liquidity-providers/liquidity-providers.module';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../src/config/database.module';
import { UsersModule } from '../src/users/users.module';
import { REPOSITORIES } from '../src/utils/constants';
import { LiquidityProvider } from '../src/entities/liquidity-provider.entity';

describe('LiquidityProvidersController (e2e)', () => {
  let app: INestApplication;

  const mockLiquidityProviders = [
    {
      id: 1,
      address: '0x123',
      totalShares: 100,
      poolLiquidity: {
        '0x123': 100,
      },
      created_at: new Date().toISOString(),
    },
  ];
  const mockRepository = {
    find: jest.fn().mockResolvedValue(mockLiquidityProviders),
    findOne: jest.fn((matcher: { where: { id: number } }) => {
      const found = mockLiquidityProviders.find(
        (lp) => lp.id == matcher.where.id,
      );
      return found
        ? Promise.resolve(found)
        : Promise.reject(new NotFoundException());
    }),
    save: jest.fn((createLiquidityProviderDto: LiquidityProvider) =>
      Promise.resolve({
        ...createLiquidityProviderDto,
        id: mockLiquidityProviders.length,
      }),
    ),
  };
  const mockDatabaseModule = {
    getRepository: jest.fn((entity: any) => {
      switch (entity) {
        case LiquidityProvider:
          return mockRepository;
      }
    }),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        DatabaseModule,
        UsersModule,
        LiquidityProvidersModule,
      ],
    })
      .overrideProvider(REPOSITORIES.DB)
      .useValue(mockDatabaseModule)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/liquidity-provider (GET)', () => {
    return request(app.getHttpServer())
      .get('/liquidity-provider')
      .expect(200)
      .then((res) => {
        expect(res.body).toEqual(mockLiquidityProviders);
      });
  });

  it('/liquidity-provider (POST)', () => {
    const mockLiquidityProvider = {
      address: '0x456',
      totalShares: 200,
      poolLiquidity: {
        '0x456': 200,
      },
    };
    return request(app.getHttpServer())
      .post('/liquidity-provider')
      .send(mockLiquidityProvider)
      .expect(201)
      .then((res) => {
        expect(res.body).toEqual({
          ...mockLiquidityProvider,
          id: mockLiquidityProviders.length,
        });
      });
  });

  it('/liquidity-provider/:id (GET)', () => {
    return request(app.getHttpServer())
      .get('/liquidity-provider/1')
      .expect(200)
      .then((res) => {
        expect(res.body).toEqual(mockLiquidityProviders[0]);
      });
  });

  it('/liquidity-provider/:id (GET)', () => {
    return request(app.getHttpServer())
      .get('/liquidity-provider/42')
      .expect(404)
      .then((res) => {
        expect(res.body).toEqual({
          statusCode: 404,
          message: 'Not Found',
        });
      });
  });
});
