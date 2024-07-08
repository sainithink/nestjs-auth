import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { ConfigModule } from '@nestjs/config';
import * as dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

describe('AuthModule (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot(), AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/auth/signup (POST)', async () => {
    const signUpDto = {
      username: 'testuser',
      password: 'Password123!',
      phone_number: '9704005190',
      email: 'testuser@example.com',
    };

    return request(app.getHttpServer())
      .post('/auth/signup')
      .send(signUpDto)
      .expect(201)
      .then(response => {
        expect(response.body).toHaveProperty('UserConfirmed', false);
      });
  });

  // Add other test cases similarly...
});
