import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { SeverityEnum } from '../src/claims/domain/value-objects/severity.enum';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

describe('Claims Integration (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        // We can override the MONGODB_URI via process.env
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    const connection: Connection = app.get(getConnectionToken());
    await connection.close();
    await app.close();
  });

  it('Should update claim totalAmount when damages are added or removed', async () => {
    // 1. Create a new Claim
    const createClaimDto = {
      title: 'Car Accident Integration Test',
      description: 'Test description',
    };

    const createRes = await request(app.getHttpServer())
      .post('/claims')
      .send(createClaimDto)
      .expect(201);

    const claimId = createRes.body.id;
    expect(claimId).toBeDefined();
    expect(createRes.body.totalAmount).toBe(0);

    // 2. Add two Damages with different prices via the API
    const damage1 = {
      part: 'Bumper',
      severity: SeverityEnum.LOW,
      price: 500,
      imageUrl: 'http://example.com/image1.jpg',
    };
    const damage2 = {
      part: 'Headlight',
      severity: SeverityEnum.MID,
      price: 300.5,
      imageUrl: 'http://example.com/image2.jpg',
    };

    await request(app.getHttpServer())
      .post(`/claims/${claimId}/damages`)
      .send(damage1)
      .expect(201);

    await request(app.getHttpServer())
      .post(`/claims/${claimId}/damages`)
      .send(damage2)
      .expect(201);

    // 3. Retrieve the Claim and expect the totalAmount to equal the sum of both damage prices
    const getRes = await request(app.getHttpServer())
      .get(`/claims/${claimId}`)
      .expect(200);

    expect(getRes.body.totalAmount).toBe(800.5);
    expect(getRes.body.damages).toHaveLength(2);

    const damageIdToDelete = getRes.body.damages[0].id;

    // 4. Delete one Damage
    await request(app.getHttpServer())
      .delete(`/claims/${claimId}/damages/${damageIdToDelete}`)
      .expect(204);

    // 5. Retrieve the Claim again and expect the totalAmount to be updated correctly
    const getResFinal = await request(app.getHttpServer())
      .get(`/claims/${claimId}`)
      .expect(200);

    expect(getResFinal.body.totalAmount).toBe(300.5);
    expect(getResFinal.body.damages).toHaveLength(1);
  });
});
