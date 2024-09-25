import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma.service';
import { ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { UserController } from './users.controller';
import { UserService } from './users.service';

describe('UserController', () => {
  let app: INestApplication;
  let userService: UserService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            createUser: jest.fn(),
            getUserById: jest.fn(),
          },
        },
        PrismaService,
      ],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    userService = module.get<UserService>(UserService);
    await app.init();
  });

  it('should register a user with valid data', async () => {
    const validUser = {
      email: 'valid@example.com',
      username: 'validuser',
      password: 'password123',
    };

    (userService.createUser as jest.Mock).mockResolvedValue({
      id: 1,
      ...validUser,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const response = await request(app.getHttpServer())
      .post('/users/register')
      .send(validUser);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.email).toBe(validUser.email);
    expect(response.body.username).toBe(validUser.username);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should delete a user and return user dto without password', async () => {
    const userId = 1;

    const userDto = {
      id: userId,
      email: 'test@example.com',
      username: 'testuser',
      firstName: 'John',
      lastName: 'Doe',
      avatarUrl: null,
      bio: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (userService.deleteUser as jest.Mock).mockResolvedValue(userDto);

    const response = await request(app.getHttpServer()).delete(
      `/users/${userId}`,
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual(userDto);
  });
});
