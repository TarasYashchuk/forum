import { PrismaService } from '../prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { UserController } from './users.controller';
import { UserService } from './users.service';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

describe('UserController', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [UserService, PrismaService],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  it('should return 400 if email is invalid', async () => {
    const response = await request(app.getHttpServer())
      .post('/users/register')
      .send({
        email: 'invalid-email',
        username: 'testuser',
        password: 'password123',
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain('email must be an email');
  });

  afterAll(async () => {
    await app.close();
  });

  describe('UserController', () => {
    let controller: UserController;
    let service: UserService;

    const mockUserService = {
      createUser: jest.fn((dto: CreateUserDto) => {
        const hashedPassword = bcrypt.hashSync(dto.password, 10);
        return Promise.resolve({
          ...dto,
          id: 1,
          password: hashedPassword,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as User);
      }),
    };

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        controllers: [UserController],
        providers: [
          { provide: UserService, useValue: mockUserService },
          PrismaService,
        ],
      }).compile();

      controller = module.get<UserController>(UserController);
      service = module.get<UserService>(UserService);
    });

    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    describe('register', () => {
      it('should create a user and return it', async () => {
        const createUserDto: CreateUserDto = {
          email: 'test@example.com',
          username: 'testuser',
          password: 'password123',
        };

        const result = await controller.register(createUserDto);

        expect(result).toHaveProperty('id');
        expect(result.email).toBe(createUserDto.email);
        expect(result.username).toBe(createUserDto.username);
        // expect(result.password).not.toBe(createUserDto.password); // ensure password is hashed
      });
    });
  });
});
