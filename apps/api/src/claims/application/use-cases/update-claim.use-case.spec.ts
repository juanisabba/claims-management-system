import { UpdateClaimUseCase } from './update-claim.use-case';
import { IClaimRepository } from '../../domain/repositories/claim.repository.interface';
import { Claim } from '../../domain/entities/claim.entity';
import { ClaimStatus } from '../../domain/value-objects/claim-status.enum';
import { ClaimNotFoundException } from '../exceptions/claim-not-found.exception';
import { DomainError } from '../../domain/errors/domain-error';
import { Damage } from 'src/claims/domain/entities/damage.entity';
import { SeverityEnum } from 'src/claims/domain/value-objects/severity.enum';

describe('UpdateClaimUseCase', () => {
  let useCase: UpdateClaimUseCase;
  let repository: jest.Mocked<IClaimRepository>;
  let saveSpy: jest.Mock;

  beforeEach(() => {
    saveSpy = jest.fn();
    repository = {
      findById: jest.fn(),
      save: saveSpy,
      findAll: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
    } as unknown as jest.Mocked<IClaimRepository>;
    useCase = new UpdateClaimUseCase(repository);
  });

  it('should update claim title and description', async () => {
    const claim = new Claim(
      'c1',
      'Old Title',
      'Old Description',
      ClaimStatus.Pending,
      [],
    );
    repository.findById.mockResolvedValue(claim);

    const dto = { title: 'New Title', description: 'New Description' };
    const result = await useCase.execute('c1', dto);

    expect(result.title).toBe('New Title');
    expect(result.description).toBe('New Description');
    expect(saveSpy).toHaveBeenCalledWith(claim);
  });

  it('should throw ClaimNotFoundException if claim does not exist', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute('non-existent', {})).rejects.toThrow(
      ClaimNotFoundException,
    );
  });

  it('should transition status', async () => {
    const claim = new Claim(
      'c1',
      'Title',
      'Description',
      ClaimStatus.Pending,
      [],
    );
    repository.findById.mockResolvedValue(claim);

    const dto = { status: ClaimStatus.InReview };
    const result = await useCase.execute('c1', dto);

    expect(result.status).toBe(ClaimStatus.InReview);
    expect(saveSpy).toHaveBeenCalled();
  });

  it('should throw DomainError when transition to Finished is invalid (High Severity + Short Description)', async () => {
    const claim = new Claim(
      'c1',
      'Title',
      'Short Description',
      ClaimStatus.Pending,
      [new Damage('d1', 'part', SeverityEnum.HIGH, 'url', 100)],
    );
    repository.findById.mockResolvedValue(claim);

    // Transitioning from Pending to Finished with high severity but short description
    const dto = { status: ClaimStatus.Finished };

    await expect(useCase.execute('c1', dto)).rejects.toThrow(DomainError);
    await expect(useCase.execute('c1', dto)).rejects.toThrow(
      'Claim description must exceed 100 characters',
    );
  });

  it('should allow transition to Finished with low severity regardless of description length', async () => {
    const claim = new Claim('c1', 'Title', 'Short', ClaimStatus.Pending, [
      new Damage('d1', 'p', SeverityEnum.LOW, 'u', 100),
    ]);
    repository.findById.mockResolvedValue(claim);

    const dto = { status: ClaimStatus.Finished };
    const result = await useCase.execute('c1', dto);
    expect(result.status).toBe(ClaimStatus.Finished);
  });
});
