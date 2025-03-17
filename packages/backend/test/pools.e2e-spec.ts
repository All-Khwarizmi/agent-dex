import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, NotFoundException } from '@nestjs/common';
import * as request from 'supertest';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../src/config/database.module';
import { REPOSITORIES } from '../src/utils/constants';
import { Pool } from '../src/entities/pool.entity';
import { PoolsModule } from '../src/pools/pools.module';
import { PoolDTO } from 'src/pools/types/pool.dto';

describe('Pools Controller (e2e)', () => {
  let app: INestApplication;

  const mockPools: Omit<Pool, 'created_at'>[] = [
    {
      id: 1,
      address: '0x123',
      token0: '0x123',
      token1: '0x123',
      reserve0: 100,
      reserve1: 100,
      swaps: 100,
    },
  ];
  const mockRepository = {
    find: jest.fn().mockResolvedValue(mockPools),
    findOne: jest.fn((matcher: { where: { id: number } }) => {
      const found = mockPools.find((lp) => lp.id == matcher.where.id);
      return found
        ? Promise.resolve(found)
        : Promise.reject(new NotFoundException());
    }),
    create: jest.fn((createPoolDto: PoolDTO) =>
      Promise.resolve({
        ...createPoolDto,
        id: mockPools.length,
      }),
    ),
    save: jest.fn((createPoolDto: PoolDTO) =>
      Promise.resolve({
        ...createPoolDto,
        id: mockPools.length,
      }),
    ),
  };
  const mockDatabaseModule = {
    getRepository: jest.fn((entity: any) => {
      switch (entity) {
        case Pool:
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
        PoolsModule,
      ],
    })
      .overrideProvider(REPOSITORIES.DB)
      .useValue(mockDatabaseModule)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/pools (GET)', () => {
    return request(app.getHttpServer())
      .get('/pools')
      .expect(200)
      .then((res) => {
        expect(res.body).toEqual(mockPools);
      });
  });

  it('/pools (POST)', () => {
    const mockPool = {
      name: 'Pool 1',
      address: '0x123',
      token0: '0x123',
      token1: '0x123',
      fee: 0.1,
      tickSpacing: 10,
      liquidity: 100,
    };
    return request(app.getHttpServer())
      .post('/pools')
      .send(mockPool)
      .expect(201)
      .then((res) => {
        expect(res.body).toEqual({
          ...mockPool,
          id: mockPools.length,
        });
      });
  });

  it('/pools/:id (GET)', () => {
    return request(app.getHttpServer())
      .get('/pools/1')
      .expect(200)
      .then((res) => {
        expect(res.body).toEqual(mockPools[0]);
      });
  });

  it('/pools/:id (GET)', () => {
    return request(app.getHttpServer())
      .get('/pools/42')
      .expect(404)
      .then((res) => {
        expect(res.body).toEqual({
          statusCode: 404,
          message: 'Not Found',
        });
      });
  });
});
