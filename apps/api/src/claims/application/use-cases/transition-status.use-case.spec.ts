import { TransitionStatusUseCase } from './transition-status.use-case';
import { IClaimRepository } from 'src/claims/domain/repositories/claim.repository.interface';
import { Claim } from 'src/claims/domain/entities/claim.entity';
import { ClaimStatus } from 'src/claims/domain/value-objects/claim-status.enum';
import { ClaimNotFoundException } from '../exceptions/claim-not-found.exception';

describe('TransitionStatusUseCase', () => {
  let useCase: TransitionStatusUseCase;
  let repository: jest.Mocked<IClaimRepository>;
  let saveSpy: jest.Mock;

  beforeEach(() => {
    saveSpy = jest.fn();
    repository = {
      findById: jest.fn(),
      save: saveSpy,
    } as any;
    useCase = new TransitionStatusUseCase(repository);
  });

  it('should transition claim status', async () => {
    const claim = new Claim('c1', 't', 'd', ClaimStatus.Pending, []);
    repository.findById.mockResolvedValue(claim);

    const result = await useCase.execute('c1', ClaimStatus.InReview);

    expect(result.status).toBe(ClaimStatus.InReview);
    expect(saveSpy).toHaveBeenCalledWith(claim);
  });

  it('should throw ClaimNotFoundException if claim does not exist', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('non-existent', ClaimStatus.InReview),
    ).rejects.toThrow(ClaimNotFoundException);
  });
});
