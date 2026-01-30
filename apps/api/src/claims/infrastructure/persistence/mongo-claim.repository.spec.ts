import { MongooseClaimRepository } from './mongo-claim.repository';
import { Claim } from '../../domain/entities/claim.entity';
import { ClaimMapper } from './mappers/claim.mapper';
import { ClaimStatus } from '../../domain/value-objects/claim-status.enum';

describe('MongooseClaimRepository', () => {
  let repository: MongooseClaimRepository;
  let mockModel: any;

  beforeEach(() => {
    mockModel = {
      findById: jest.fn(),
      find: jest.fn(),
      updateOne: jest.fn(),
      deleteOne: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      countDocuments: jest.fn(),
    } as any;
    repository = new MongooseClaimRepository(mockModel);
  });

  const claim = new Claim('c1', 't', 'd', ClaimStatus.Pending, []);

  it('should save a claim', async () => {
    const mockExec = jest.fn().mockResolvedValue({});
    mockModel.updateOne.mockReturnValue({ exec: mockExec } as any);

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
    } as any);

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
    } as any);

    const result = await repository.findById('non-existent');

    expect(result).toBeNull();
  });

  it('should find all claims', async () => {
    const rawClaim = ClaimMapper.toPersistence(claim);
    const mockExecFind = jest.fn().mockResolvedValue([rawClaim]);
    const mockExecCount = jest.fn().mockResolvedValue(1);

    mockModel.find.mockReturnValue({
      skip: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnValue({
            exec: mockExecFind,
          }),
        }),
      }),
    } as any);

    mockModel.countDocuments.mockReturnValue({
      exec: mockExecCount,
    } as any);

    const result = await repository.findAll({ limit: 10, offset: 0 });

    expect(result.data).toHaveLength(1);
    expect(result.data[0].id).toBe('c1');
    expect(result.total).toBe(1);
    expect(result.limit).toBe(10);
    expect(result.offset).toBe(0);
  });

  it('should update a claim', async () => {
    const mockExec = jest.fn().mockResolvedValue({});
    mockModel.updateOne.mockReturnValue({ exec: mockExec } as any);

    await repository.update(claim);

    expect(mockModel.updateOne).toHaveBeenCalled();
  });

  it('should delete a claim', async () => {
    const mockExec = jest.fn().mockResolvedValue({});
    mockModel.deleteOne.mockReturnValue({ exec: mockExec } as any);

    await repository.delete('c1');

    expect(mockModel.deleteOne).toHaveBeenCalledWith({ _id: 'c1' });
    expect(mockExec).toHaveBeenCalled();
  });

  // ⭐ NUEVOS TESTS PARA 100% BRANCH COVERAGE
  describe('Edge Cases - Branch Coverage', () => {
    it('should return empty array when no claims found', async () => {
      // ⭐ Cubre el branch de array vacío en findAll
      const mockExecFind = jest.fn().mockResolvedValue([]);
      const mockExecCount = jest.fn().mockResolvedValue(0);

      mockModel.find.mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            lean: jest.fn().mockReturnValue({
              exec: mockExecFind,
            }),
          }),
        }),
      } as any);

      mockModel.countDocuments.mockReturnValue({
        exec: mockExecCount,
      } as any);

      const result = await repository.findAll({});

      expect(result.data).toEqual([]);
      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(mockModel.find).toHaveBeenCalledWith({});
    });

    it('should handle filters in findAll', async () => {
      const rawClaim = ClaimMapper.toPersistence(claim);
      const mockExecFind = jest.fn().mockResolvedValue([rawClaim]);
      const mockExecCount = jest.fn().mockResolvedValue(1);

      mockModel.find.mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            lean: jest.fn().mockReturnValue({
              exec: mockExecFind,
            }),
          }),
        }),
      } as any);

      mockModel.countDocuments.mockReturnValue({
        exec: mockExecCount,
      } as any);

      const filters = { status: ClaimStatus.Pending };
      const result = await repository.findAll(filters);

      expect(result.data).toHaveLength(1);
      expect(mockModel.find).toHaveBeenCalledWith(filters);
    });

    it('should handle multiple claims in findAll', async () => {
      const claim2 = new Claim('c2', 't2', 'd2', ClaimStatus.InReview, []);
      const rawClaim1 = ClaimMapper.toPersistence(claim);
      const rawClaim2 = ClaimMapper.toPersistence(claim2);

      const mockExecFind = jest.fn().mockResolvedValue([rawClaim1, rawClaim2]);
      const mockExecCount = jest.fn().mockResolvedValue(2);

      mockModel.find.mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            lean: jest.fn().mockReturnValue({
              exec: mockExecFind,
            }),
          }),
        }),
      } as any);

      mockModel.countDocuments.mockReturnValue({
        exec: mockExecCount,
      } as any);

      const result = await repository.findAll({});

      expect(result.data).toHaveLength(2);
      expect(result.data[0].id).toBe('c1');
      expect(result.data[1].id).toBe('c2');
      expect(result.total).toBe(2);
    });
  });
});
