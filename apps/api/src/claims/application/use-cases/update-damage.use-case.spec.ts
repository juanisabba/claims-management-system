import { UpdateDamageUseCase } from './update-damage.use-case';
import { IClaimRepository } from 'src/claims/domain/repositories/claim.repository.interface';
import { Claim } from 'src/claims/domain/entities/claim.entity';
import { Damage } from 'src/claims/domain/entities/damage.entity';
import { ClaimStatus } from 'src/claims/domain/value-objects/claim-status.enum';
import { SeverityEnum } from 'src/claims/domain/value-objects/severity.enum';
import { ClaimNotFoundException } from '../exceptions/claim-not-found.exception';
import { DomainError } from 'src/claims/domain/errors/domain-error';

describe('UpdateDamageUseCase', () => {
  let useCase: UpdateDamageUseCase;
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
    useCase = new UpdateDamageUseCase(repository);
  });

  it('should update damage details', async () => {
    const damage = new Damage('d1', 'part', SeverityEnum.LOW, 'url', 100);
    const claim = new Claim('c1', 't', 'd', ClaimStatus.Pending, [damage]);
    repository.findById.mockResolvedValue(claim);

    const dto = { part: 'new part', price: 200 };
    const result = await useCase.execute('c1', 'd1', dto);

    expect(result.damages[0].part).toBe('new part');
    expect(result.damages[0].price).toBe(200);
    expect(result.damages[0].severity).toBe(SeverityEnum.LOW); // Unchanged
    expect(saveSpy).toHaveBeenCalledWith(claim);
  });

  it('should update all damage details when provided', async () => {
    const damage = new Damage('d1', 'part', SeverityEnum.LOW, 'url', 100);
    const claim = new Claim('c1', 't', 'd', ClaimStatus.Pending, [damage]);
    repository.findById.mockResolvedValue(claim);

    const dto = {
      part: 'new part',
      price: 200,
      severity: SeverityEnum.HIGH,
      imageUrl: 'new url',
    };
    const result = await useCase.execute('c1', 'd1', dto);

    expect(result.damages[0].part).toBe('new part');
    expect(result.damages[0].price).toBe(200);
    expect(result.damages[0].severity).toBe(SeverityEnum.HIGH);
    expect(result.damages[0].imageUrl).toBe('new url');
  });

  it('should update only some damage details and keep others', async () => {
    const damage = new Damage('d1', 'part', SeverityEnum.LOW, 'url', 100);
    const claim = new Claim('c1', 't', 'd', ClaimStatus.Pending, [damage]);
    repository.findById.mockResolvedValue(claim);

    const dto = { severity: SeverityEnum.MID };
    const result = await useCase.execute('c1', 'd1', dto);

    expect(result.damages[0].part).toBe('part'); // Unchanged
    expect(result.damages[0].price).toBe(100); // Unchanged
    expect(result.damages[0].severity).toBe(SeverityEnum.MID); // Changed
    expect(result.damages[0].imageUrl).toBe('url'); // Unchanged
  });

  it('should update nothing when DTO is empty', async () => {
    const damage = new Damage('d1', 'part', SeverityEnum.LOW, 'url', 100);
    const claim = new Claim('c1', 't', 'd', ClaimStatus.Pending, [damage]);
    repository.findById.mockResolvedValue(claim);

    const dto = {};
    const result = await useCase.execute('c1', 'd1', dto);

    expect(result.damages[0].part).toBe('part');
    expect(result.damages[0].price).toBe(100);
    expect(result.damages[0].severity).toBe(SeverityEnum.LOW);
    expect(result.damages[0].imageUrl).toBe('url');
  });

  it('should throw ClaimNotFoundException if claim does not exist', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute('non-existent', 'd1', {})).rejects.toThrow(
      ClaimNotFoundException,
    );
  });

  it('should throw DomainError if claim is not pending', async () => {
    const claim = new Claim('c1', 't', 'd', ClaimStatus.InReview, []);
    repository.findById.mockResolvedValue(claim);

    await expect(useCase.execute('c1', 'd1', {})).rejects.toThrow(DomainError);
    await expect(useCase.execute('c1', 'd1', {})).rejects.toThrow(
      'Damages can only be updated when claim is Pending',
    );
  });

  it('should throw DomainError if damage does not exist in claim', async () => {
    const claim = new Claim('c1', 't', 'd', ClaimStatus.Pending, []);
    repository.findById.mockResolvedValue(claim);

    await expect(useCase.execute('c1', 'd1', {})).rejects.toThrow(DomainError);
    await expect(useCase.execute('c1', 'd1', {})).rejects.toThrow(
      'Damage with ID d1 not found',
    );
  });
});
