import { ClaimController } from './claim.controller';
import { CreateClaimUseCase } from '../../application/use-cases/create-claim.use-case';
import { AddDamageUseCase } from '../../application/use-cases/add-damage.use-case';
import { UpdateClaimUseCase } from '../../application/use-cases/update-claim.use-case';
import { GetClaimByIdUseCase } from '../../application/use-cases/get-claim-by-id.use-case';
import { UpdateDamageUseCase } from 'src/claims/application/use-cases/update-damage.use-case';
import { RemoveDamageUseCase } from 'src/claims/application/use-cases/remove-damage.use-case';
import { IClaimRepository } from '../../domain/repositories/claim.repository.interface';
import { Claim } from '../../domain/entities/claim.entity';
import { ClaimStatus } from '../../domain/value-objects/claim-status.enum';
import { SeverityEnum } from '../../domain/value-objects/severity.enum';

describe('ClaimController', () => {
  let controller: ClaimController;
  let createClaimUseCase: jest.Mocked<CreateClaimUseCase>;
  let addDamageUseCase: jest.Mocked<AddDamageUseCase>;
  let updateClaimUseCase: jest.Mocked<UpdateClaimUseCase>;
  let getClaimByIdUseCase: jest.Mocked<GetClaimByIdUseCase>;
  let updateDamageUseCase: jest.Mocked<UpdateDamageUseCase>;
  let removeDamageUseCase: jest.Mocked<RemoveDamageUseCase>;
  let repository: jest.Mocked<IClaimRepository>;

  beforeEach(() => {
    createClaimUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<CreateClaimUseCase>;
    addDamageUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<AddDamageUseCase>;
    updateClaimUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<UpdateClaimUseCase>;
    getClaimByIdUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GetClaimByIdUseCase>;
    updateDamageUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<UpdateDamageUseCase>;
    removeDamageUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<RemoveDamageUseCase>;
    repository = {
      findAll: jest.fn(),
    } as unknown as jest.Mocked<IClaimRepository>;

    controller = new ClaimController(
      createClaimUseCase,
      addDamageUseCase,
      updateClaimUseCase,
      getClaimByIdUseCase,
      updateDamageUseCase,
      removeDamageUseCase,
      repository,
    );
  });

  const claim = new Claim('c1', 't', 'd', ClaimStatus.Pending, []);

  it('should create a claim', async () => {
    createClaimUseCase.execute.mockResolvedValue(claim);
    const result = await controller.create({
      title: 't',
      description: 'd',
      damages: [],
    });
    expect(result.id).toBe('c1');
  });

  it('should add damage', async () => {
    addDamageUseCase.execute.mockResolvedValue(claim);
    const result = await controller.addDamage('c1', {
      part: 'p',
      severity: SeverityEnum.LOW,
      imageUrl: 'http://i',
      price: 10,
    });
    expect(result.id).toBe('c1');
  });

  it('should update damage', async () => {
    updateDamageUseCase.execute.mockResolvedValue(claim);
    const result = await controller.updateDamage('c1', 'd1', {
      part: 'p2',
    });
    expect(result.id).toBe('c1');
  });

  it('should remove damage', async () => {
    removeDamageUseCase.execute.mockResolvedValue(claim);
    const result = await controller.removeDamage('c1', 'd1');
    expect(result.id).toBe('c1');
  });

  it('should update claim', async () => {
    updateClaimUseCase.execute.mockResolvedValue(claim);
    const result = await controller.update('c1', {
      title: 't2',
    });
    expect(result.id).toBe('c1');
  });

  it('should find all claims', async () => {
    repository.findAll.mockResolvedValue({
      data: [
        {
          id: 'c1',
          title: 't',
          description: 'd',
          status: ClaimStatus.Pending,
          totalAmount: 0,
        },
      ],
      total: 1,
      limit: 10,
      offset: 0,
    });
    const result = await controller.findAll();
    expect(result.data).toHaveLength(1);
    expect(result.data[0].id).toBe('c1');
    expect(result.total).toBe(1);
  });

  it('should return empty array when no claims found', async () => {
    repository.findAll.mockResolvedValue({
      data: [],
      total: 0,
      limit: 10,
      offset: 0,
    });
    const result = await controller.findAll();
    expect(result.data).toHaveLength(0);
    expect(result.total).toBe(0);
  });

  it('should find one claim', async () => {
    getClaimByIdUseCase.execute.mockResolvedValue(claim);
    const result = await controller.findOne('c1');
    expect(result.id).toBe('c1');
  });

  it('should find damages for a claim', async () => {
    const claimWithDamages = new Claim('c1', 't', 'd', ClaimStatus.Pending, [
      {
        id: 'd1',
        part: 'p1',
        severity: SeverityEnum.LOW,
        imageUrl: 'i1',
        price: 10,
      },
    ]);
    getClaimByIdUseCase.execute.mockResolvedValue(claimWithDamages);
    const result = await controller.findDamages('c1', '5', '0');
    expect(result.data).toHaveLength(1);
    expect(result.data[0].id).toBe('d1');
    expect(result.total).toBe(1);
  });
});
