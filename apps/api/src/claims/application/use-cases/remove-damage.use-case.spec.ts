import { RemoveDamageUseCase } from './remove-damage.use-case';
import { IClaimRepository } from 'src/claims/domain/repositories/claim.repository.interface';
import { Claim } from 'src/claims/domain/entities/claim.entity';
import { ClaimStatus } from 'src/claims/domain/value-objects/claim-status.enum';
import { Damage } from 'src/claims/domain/entities/damage.entity';
import { SeverityEnum } from 'src/claims/domain/value-objects/severity.enum';
import { ClaimNotFoundException } from '../exceptions/claim-not-found.exception';
import { DomainError } from 'src/claims/domain/errors/domain-error';

describe('RemoveDamageUseCase', () => {
  let useCase: RemoveDamageUseCase;
  let repository: jest.Mocked<IClaimRepository>;
  let saveSpy: jest.Mock;

  beforeEach(() => {
    saveSpy = jest.fn();
    repository = {
      findById: jest.fn(),
      save: saveSpy,
    } as unknown as jest.Mocked<IClaimRepository>;
    useCase = new RemoveDamageUseCase(repository);
  });

  it('should remove a damage from a pending claim and return updated claim', async () => {
    const damage = new Damage('d1', 'part', SeverityEnum.LOW, 'url', 100);
    const claim = new Claim('c1', 'title', 'desc', ClaimStatus.Pending, [
      damage,
    ]);
    repository.findById.mockResolvedValue(claim);

    const result = await useCase.execute('c1', 'd1');

    expect(result.damages).toHaveLength(0);
    expect(saveSpy).toHaveBeenCalledWith(claim);
    expect(result).toBe(claim);
  });

  it('should throw ClaimNotFoundException if claim does not exist', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute('non-existent', 'd1')).rejects.toThrow(
      ClaimNotFoundException,
    );
  });

  it('should throw DomainError if claim is not pending', async () => {
    const claim = new Claim('c1', 'title', 'desc', ClaimStatus.InReview, []);
    repository.findById.mockResolvedValue(claim);

    await expect(useCase.execute('c1', 'd1')).rejects.toThrow(DomainError);
    await expect(useCase.execute('c1', 'd1')).rejects.toThrow(
      'Damages can only be removed when claim is Pending',
    );
  });
});
