import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;
  let app: INestApplication;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();

    controller = module.get<HealthController>(HealthController);

    app = module.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('check() should return expected status object', () => {
    const result = controller.check();
    expect(result.status).toBe('ok');
    expect(result).toHaveProperty('timestamp');
  });

  it('should return 200 status code', async () => {
    await request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect((res) => {
        expect(res.body.status).toBe('ok');
        expect(res.body).toHaveProperty('timestamp');
      });
  });
});
