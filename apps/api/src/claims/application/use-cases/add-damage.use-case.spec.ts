import { AddDamageUseCase } from './add-damage.use-case';
import { IClaimRepository } from 'src/claims/domain/repositories/claim.repository.interface';
import { Claim } from 'src/claims/domain/entities/claim.entity';
import { ClaimStatus } from 'src/claims/domain/value-objects/claim-status.enum';
import { SeverityEnum } from 'src/claims/domain/value-objects/severity.enum';
import { ClaimNotFoundException } from '../exceptions/claim-not-found.exception';
import { DomainError } from 'src/claims/domain/errors/domain-error';

describe('AddDamageUseCase', () => {
  let useCase: AddDamageUseCase;
  let repository: jest.Mocked<IClaimRepository>;
  let saveSpy: jest.Mock;

  beforeEach(() => {
    saveSpy = jest.fn();
    repository = {
      save: saveSpy,
      findById: jest.fn(),
      findAll: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
    } as any;
    useCase = new AddDamageUseCase(repository);
  });

  it('should add damage to a pending claim', async () => {
    const claim = new Claim(
      'c1',
      'Title',
      'Description',
      ClaimStatus.Pending,
      [],
    );
    repository.findById.mockResolvedValue(claim);

    const dto = {
      part: 'Door',
      severity: SeverityEnum.LOW,
      imageUrl: 'http://image.com',
      price: 100,
    };

    const result = await useCase.execute('c1', dto);

    expect(result.damages).toHaveLength(1);
    expect(result.damages[0].part).toBe(dto.part);
    expect(saveSpy).toHaveBeenCalledWith(claim);
  });

  it('should throw ClaimNotFoundException if claim does not exist', async () => {
    repository.findById.mockResolvedValue(null);
    const dto = {
      part: 'Door',
      severity: SeverityEnum.LOW,
      imageUrl: 'http://image.com',
      price: 100,
    };

    await expect(useCase.execute('non-existent', dto)).rejects.toThrow(
      ClaimNotFoundException,
    );
  });

  it('should throw DomainError if claim is not pending', async () => {
    const claim = new Claim(
      'c1',
      'Title',
      'Description',
      ClaimStatus.InReview,
      [],
    );
    repository.findById.mockResolvedValue(claim);
    const dto = {
      part: 'Door',
      severity: SeverityEnum.LOW,
      imageUrl: 'http://image.com',
      price: 100,
    };

    await expect(useCase.execute('c1', dto)).rejects.toThrow(DomainError);
    await expect(useCase.execute('c1', dto)).rejects.toThrow(
      'Damages can only be added when claim is Pending',
    );
  });
});
