import { CreateClaimUseCase } from './create-claim.use-case';
import { IClaimRepository } from 'src/claims/domain/repositories/claim.repository.interface';
import { CreateClaimDto } from '../dtos/create-claim.dto';
import { ClaimStatus } from 'src/claims/domain/value-objects/claim-status.enum';
import { SeverityEnum } from 'src/claims/domain/value-objects/severity.enum';

describe('CreateClaimUseCase', () => {
  let useCase: CreateClaimUseCase;
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
    useCase = new CreateClaimUseCase(repository);
  });

  it('should create a claim with damages', async () => {
    const dto: CreateClaimDto = {
      title: 'Test Claim',
      description: 'Test Description',
      damages: [
        {
          part: 'Door',
          severity: SeverityEnum.LOW,
          imageUrl: 'http://image.com',
          price: 100,
        },
      ],
    };

    const result = await useCase.execute(dto);

    expect(result.title).toBe(dto.title);
    expect(result.description).toBe(dto.description);
    expect(result.status).toBe(ClaimStatus.Pending);
    expect(result.damages).toHaveLength(1);
    expect(saveSpy).toHaveBeenCalledWith(result);
  });

  it('should create a claim without damages', async () => {
    const dto: CreateClaimDto = {
      title: 'Test Claim',
      description: 'Test Description',
      damages: [],
    };

    const result = await useCase.execute(dto);

    expect(result.damages).toHaveLength(0);
    expect(saveSpy).toHaveBeenCalled();
  });

  it('should handle null damages in dto', async () => {
    const dto: any = {
      title: 'Test Claim',
      description: 'Test Description',
      damages: null,
    };

    const result = await useCase.execute(dto);

    expect(result.damages).toEqual([]);
    expect(saveSpy).toHaveBeenCalled();
  });
});
