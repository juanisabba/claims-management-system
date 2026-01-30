import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { MongooseClaimRepository } from './mongo-claim.repository';
import { Claim } from '../../domain/entities/claim.entity';
import { ClaimMapper } from './mappers/claim.mapper';
import { ClaimStatus } from '../../domain/value-objects/claim-status.enum';

describe('MongooseClaimRepository', () => {
  let repository: MongooseClaimRepository;
  let mockModel: {
    findById: jest.Mock;
    find: jest.Mock;
    updateOne: jest.Mock;
    deleteOne: jest.Mock;
    findByIdAndUpdate: jest.Mock;
    countDocuments: jest.Mock;
  };

  beforeEach(async () => {
    mockModel = {
      findById: jest.fn(),
      find: jest.fn(),
      updateOne: jest.fn(),
      deleteOne: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      countDocuments: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MongooseClaimRepository,
        {
          provide: getModelToken('Claim'),
          useValue: mockModel,
        },
      ],
    }).compile();

    repository = module.get<MongooseClaimRepository>(MongooseClaimRepository);
  });

  const claim = new Claim('c1', 't', 'd', ClaimStatus.Pending, []);

  it('should save a claim', async () => {
    const mockExec = jest.fn().mockResolvedValue({});
    mockModel.updateOne.mockReturnValue({ exec: mockExec } as unknown);

    await repository.save(claim);

    expect(mockModel.updateOne).toHaveBeenCalled();
    expect(mockExec).toHaveBeenCalled();
  });

  it('should find a claim by id', async () => {
    const rawClaim = ClaimMapper.toPersistence(claim);
    const mockExec = jest.fn().mockResolvedValue(rawClaim);
    mockModel.findById.mockReturnValue({
      lean: jest.fn().mockReturnValue({
        exec: mockExec,
      }),
    } as unknown);

    const result = await repository.findById('c1');

    expect(result?.id).toBe('c1');
    expect(mockModel.findById).toHaveBeenCalledWith('c1');
  });

  it('should return null if claim not found', async () => {
    const mockExec = jest.fn().mockResolvedValue(null);
    mockModel.findById.mockReturnValue({
      lean: jest.fn().mockReturnValue({
        exec: mockExec,
      }),
    } as unknown);

    const result = await repository.findById('non-existent');

    expect(result).toBeNull();
  });

  it('should find all claims', async () => {
    const rawClaim = ClaimMapper.toPersistence(claim);
    const mockExecFind = jest.fn().mockResolvedValue([rawClaim]);
    const mockExecCount = jest.fn().mockResolvedValue(1);

    mockModel.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            lean: jest.fn().mockReturnValue({
              exec: mockExecFind,
            }),
          }),
        }),
      }),
    } as unknown);

    mockModel.countDocuments.mockReturnValue({
      exec: mockExecCount,
    } as unknown);

    const result = await repository.findAll({ limit: 10, offset: 0 });

    expect(result.data).toHaveLength(1);
    expect(result.data[0].id).toBe('c1');
    expect(result.total).toBe(1);
    expect(result.limit).toBe(10);
    expect(result.offset).toBe(0);
  });

  it('should update a claim', async () => {
    const mockExec = jest.fn().mockResolvedValue({});
    mockModel.updateOne.mockReturnValue({ exec: mockExec } as unknown);

    await repository.update(claim);

    expect(mockModel.updateOne).toHaveBeenCalled();
  });

  it('should delete a claim', async () => {
    const mockExec = jest.fn().mockResolvedValue({});
    mockModel.deleteOne.mockReturnValue({ exec: mockExec } as unknown);

    await repository.delete('c1');

    expect(mockModel.deleteOne).toHaveBeenCalledWith({ _id: 'c1' });
    expect(mockExec).toHaveBeenCalled();
  });

  describe('Edge Cases - Branch Coverage', () => {
    it('should return empty array when no claims found', async () => {
      const mockExecFind = jest.fn().mockResolvedValue([]);
      const mockExecCount = jest.fn().mockResolvedValue(0);

      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              lean: jest.fn().mockReturnValue({
                exec: mockExecFind,
              }),
            }),
          }),
        }),
      } as unknown);

      mockModel.countDocuments.mockReturnValue({
        exec: mockExecCount,
      } as unknown);

      const result = await repository.findAll({});

      expect(result.data).toEqual([]);
      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(mockModel.find).toHaveBeenCalledWith(
        {},
        {
          description: 1,
          status: 1,
          title: 1,
          totalAmount: 1,
        },
      );
    });

    it('should handle filters in findAll', async () => {
      const rawClaim = ClaimMapper.toPersistence(claim);
      const mockExecFind = jest.fn().mockResolvedValue([rawClaim]);
      const mockExecCount = jest.fn().mockResolvedValue(1);

      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              lean: jest.fn().mockReturnValue({
                exec: mockExecFind,
              }),
            }),
          }),
        }),
      } as unknown);

      mockModel.countDocuments.mockReturnValue({
        exec: mockExecCount,
      } as unknown);

      const filters = { status: ClaimStatus.Pending };
      const result = await repository.findAll(filters);

      expect(result.data).toHaveLength(1);
      expect(mockModel.find).toHaveBeenCalledWith(filters, {
        description: 1,
        status: 1,
        title: 1,
        totalAmount: 1,
      });
    });

    it('should handle partial pagination filters in findAll', async () => {
      const mockExecFind = jest.fn().mockResolvedValue([]);
      const mockExecCount = jest.fn().mockResolvedValue(0);

      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              lean: jest.fn().mockReturnValue({
                exec: mockExecFind,
              }),
            }),
          }),
        }),
      } as unknown);

      mockModel.countDocuments.mockReturnValue({
        exec: mockExecCount,
      } as unknown);

      // Only limit
      await repository.findAll({ limit: 5 });
      // Only offset
      await repository.findAll({ offset: 10 });

      expect(mockModel.find).toHaveBeenCalled();
    });

    it('should handle multiple claims in findAll', async () => {
      const claim2 = new Claim('c2', 't2', 'd2', ClaimStatus.InReview, []);
      const rawClaim1 = ClaimMapper.toPersistence(claim);
      const rawClaim2 = ClaimMapper.toPersistence(claim2);

      const mockExecFind = jest.fn().mockResolvedValue([rawClaim1, rawClaim2]);
      const mockExecCount = jest.fn().mockResolvedValue(2);

      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              lean: jest.fn().mockReturnValue({
                exec: mockExecFind,
              }),
            }),
          }),
        }),
      } as unknown);

      mockModel.countDocuments.mockReturnValue({
        exec: mockExecCount,
      } as unknown);

      const result = await repository.findAll({});

      expect(result.data).toHaveLength(2);
      expect(result.data[0].id).toBe('c1');
      expect(result.data[1].id).toBe('c2');
      expect(result.total).toBe(2);
    });
  });
});
