import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, NotFoundException } from '@nestjs/common';
import * as request from 'supertest';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../src/config/database.module';
import { REPOSITORIES } from '../src/utils/constants';
import { PoolDTO } from 'src/pools/types/pool.dto';
import { User, UserStatus } from '../src/entities/user.entity';
import { UsersModule } from '../src/users/users.module';

describe('Users Controller (e2e)', () => {
  let app: INestApplication;

  const mockUsers: Omit<User, 'created_at' | 'liquidityProvider'>[] = [
    {
      id: 1,
      address: '0x123',
      swaps: 100,
      email: 'john@example.com',
      status: UserStatus.ACTIVE,
      name: 'John Doe',
    },
  ];
  const mockRepository = {
    find: jest.fn().mockResolvedValue(mockUsers),
    findOne: jest.fn((matcher: { where: { id: number } }) => {
      const found = mockUsers.find((lp) => lp.id == matcher.where.id);
      return found
        ? Promise.resolve(found)
        : Promise.reject(new NotFoundException());
    }),
    create: jest.fn((createPoolDto: PoolDTO) =>
      Promise.resolve({
        ...createPoolDto,
        id: mockUsers.length,
      }),
    ),
    save: jest.fn((createPoolDto: PoolDTO) =>
      Promise.resolve({
        ...createPoolDto,
        id: mockUsers.length,
      }),
    ),
  };
  const mockDatabaseModule = {
    getRepository: jest.fn((entity: any) => {
      switch (entity) {
        case User:
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
      ],
    })
      .overrideProvider(REPOSITORIES.DB)
      .useValue(mockDatabaseModule)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/users (GET)', () => {
    return request(app.getHttpServer())
      .get('/users')
      .expect(200)
      .then((res) => {
        expect(res.body).toEqual(mockUsers);
      });
  });

  it('/users (POST)', () => {
    const mockUser = {
      name: 'John Doe',
      address: '0x123',
      email: 'john@example.com',
      swaps: 100,
      status: UserStatus.ACTIVE,
      liquidityProvider: {},
    };
    return request(app.getHttpServer())
      .post('/users')
      .send(mockUser)
      .expect(201)
      .then((res) => {
        expect(res.body).toEqual({
          ...mockUser,
          id: mockUsers.length,
        });
      });
  });

  it('/users/:id (GET)', () => {
    return request(app.getHttpServer())
      .get('/users/1')
      .expect(200)
      .then((res) => {
        expect(res.body).toEqual(mockUsers[0]);
      });
  });

  it('/users/:id (GET)', () => {
    return request(app.getHttpServer())
      .get('/users/42')
      .expect(404)
      .then((res) => {
        expect(res.body).toEqual({
          statusCode: 404,
          message: 'Not Found',
        });
      });
  });
});
