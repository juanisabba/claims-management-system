import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import * as fs from 'fs';

describe('AppController (e2e)', () => {
  jest.setTimeout(60000);
  let app: INestApplication<App>;

  beforeEach(async () => {
    if (!fs.existsSync('/.dockerenv') && !fs.existsSync('/run/.containerenv')) {
      const defaultUri = 'mongodb://mongodb:27017/claims_db';
      if (
        !process.env.MONGODB_URI ||
        process.env.MONGODB_URI.includes('mongodb://mongodb')
      ) {
        process.env.MONGODB_URI = (
          process.env.MONGODB_URI || defaultUri
        ).replace('mongodb://mongodb', 'mongodb://localhost');
      }
    }
    console.log('Connecting to:', process.env.MONGODB_URI);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    const connection: Connection = app.get(getConnectionToken());
    await connection.close();
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});
