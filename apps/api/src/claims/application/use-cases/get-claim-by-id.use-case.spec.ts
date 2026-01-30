import { GetClaimByIdUseCase } from './get-claim-by-id.use-case';
import { IClaimRepository } from 'src/claims/domain/repositories/claim.repository.interface';
import { Claim } from 'src/claims/domain/entities/claim.entity';
import { ClaimNotFoundException } from '../exceptions/claim-not-found.exception';

describe('GetClaimByIdUseCase', () => {
  let useCase: GetClaimByIdUseCase;
  let repository: jest.Mocked<IClaimRepository>;
  let findByIdSpy: jest.Mock;

  beforeEach(() => {
    findByIdSpy = jest.fn();
    repository = {
      findById: findByIdSpy,
    } as unknown as jest.Mocked<IClaimRepository>;
    useCase = new GetClaimByIdUseCase(repository);
  });

  it('should return a claim if it exists', async () => {
    const claim = new Claim('c1', 't', 'd');
    findByIdSpy.mockResolvedValue(claim);

    const result = await useCase.execute('c1');

    expect(result).toBe(claim);
    expect(findByIdSpy).toHaveBeenCalledWith('c1');
  });

  it('should throw ClaimNotFoundException if claim does not exist', async () => {
    findByIdSpy.mockResolvedValue(null);

    await expect(useCase.execute('non-existent')).rejects.toThrow(
      ClaimNotFoundException,
    );
  });
});
