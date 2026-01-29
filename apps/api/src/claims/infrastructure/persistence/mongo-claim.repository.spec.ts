import { MongooseClaimRepository } from './mongo-claim.repository';
import { Model } from 'mongoose';
import { ClaimDocument } from './schemas/claim.schema';
import { Claim } from '../../domain/entities/claim.entity';
import { ClaimMapper } from './mappers/claim.mapper';
import { ClaimStatus } from '../../domain/value-objects/claim-status.enum';

describe('MongooseClaimRepository', () => {
  let repository: MongooseClaimRepository;
  let mockModel: jest.Mocked<Model<ClaimDocument>>;

  beforeEach(() => {
    mockModel = {
      findById: jest.fn(),
      find: jest.fn(),
      updateOne: jest.fn(),
      deleteOne: jest.fn(),
      findByIdAndUpdate: jest.fn(),
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

  it('should handle findById returning undefined', async () => {
    const mockExec = jest.fn().mockResolvedValue(undefined);
    mockModel.findById.mockReturnValue({
      lean: jest.fn().mockReturnValue({
        exec: mockExec,
      }),
    } as any);

    const result = await repository.findById('undefined-id');

    expect(result).toBeNull();
  });

  it('should find all claims', async () => {
    const rawClaim = ClaimMapper.toPersistence(claim);
    const mockExec = jest.fn().mockResolvedValue([rawClaim]);
    mockModel.find.mockReturnValue({
      lean: jest.fn().mockReturnValue({
        exec: mockExec,
      }),
    } as any);

    const result = await repository.findAll({});

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('c1');
  });

  it('should return empty array when no claims found', async () => {
    const mockExec = jest.fn().mockResolvedValue([]);
    mockModel.find.mockReturnValue({
      lean: jest.fn().mockReturnValue({
        exec: mockExec,
      }),
    } as any);

    const result = await repository.findAll({});

    expect(result).toEqual([]);
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
});
