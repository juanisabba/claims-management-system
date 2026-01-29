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
    createClaimUseCase = { execute: jest.fn() } as any;
    addDamageUseCase = { execute: jest.fn() } as any;
    updateClaimUseCase = { execute: jest.fn() } as any;
    getClaimByIdUseCase = { execute: jest.fn() } as any;
    updateDamageUseCase = { execute: jest.fn() } as any;
    removeDamageUseCase = { execute: jest.fn() } as any;
    repository = { findAll: jest.fn() } as any;

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
    const result = await controller.addDamage('c1', {} as any);
    expect(result.id).toBe('c1');
  });

  it('should update damage', async () => {
    updateDamageUseCase.execute.mockResolvedValue(claim);
    const result = await controller.updateDamage('c1', 'd1', {} as any);
    expect(result.id).toBe('c1');
  });

  it('should remove damage', async () => {
    removeDamageUseCase.execute.mockResolvedValue(claim);
    const result = await controller.removeDamage('c1', 'd1');
    expect(result.id).toBe('c1');
  });

  it('should update claim', async () => {
    updateClaimUseCase.execute.mockResolvedValue(claim);
    const result = await controller.update('c1', {} as any);
    expect(result.id).toBe('c1');
  });

  it('should find all claims', async () => {
    repository.findAll.mockResolvedValue([claim]);
    const result = await controller.findAll();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('c1');
  });

  it('should return empty array when no claims found', async () => {
    repository.findAll.mockResolvedValue([]);
    const result = await controller.findAll();
    expect(result).toHaveLength(0);
  });

  it('should find one claim', async () => {
    getClaimByIdUseCase.execute.mockResolvedValue(claim);
    const result = await controller.findOne('c1');
    expect(result.id).toBe('c1');
  });
});
