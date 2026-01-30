import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ClaimDocument } from './schemas/claim.schema';
import {
  IClaimRepository,
  ClaimFilters,
  PaginatedResult,
  ClaimSummary,
} from '../../domain/repositories/claim.repository.interface';
import { Claim } from '../../domain/entities/claim.entity';
import { ClaimStatus } from '../../domain/value-objects/claim-status.enum';
import { ClaimMapper, RawClaim } from './mappers/claim.mapper';

@Injectable()
export class MongooseClaimRepository implements IClaimRepository {
  constructor(
    @InjectModel('Claim')
    private readonly claimModel: Model<ClaimDocument>,
  ) {}

  async save(claim: Claim): Promise<void> {
    const rawClaim = ClaimMapper.toPersistence(claim);
    await this.claimModel
      .updateOne({ _id: rawClaim._id }, { $set: rawClaim }, { upsert: true })
      .exec();
  }

  async findById(id: string): Promise<Claim | null> {
    const document = await this.claimModel.findById(id).lean().exec();

    if (!document) return null;

    const rawClaim = document as unknown as RawClaim;
    return ClaimMapper.toDomain(rawClaim);
  }

  async findAll(filters: ClaimFilters): Promise<PaginatedResult<ClaimSummary>> {
    const { limit = 10, offset = 0, ...queryFilters } = filters;

    const [documents, total] = await Promise.all([
      this.claimModel
        .find(queryFilters, {
          title: 1,
          description: 1,
          status: 1,
          totalAmount: 1,
        })
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .lean()
        .exec(),
      this.claimModel.countDocuments(queryFilters).exec(),
    ]);

    return {
      data: documents.map((doc) => {
        const raw = doc as unknown as RawClaim;
        return {
          id: raw._id.toString(),
          title: raw.title,
          description: raw.description,
          status: raw.status as ClaimStatus,
          totalAmount: raw.totalAmount,
        };
      }),
      total,
      limit,
      offset,
    };
  }
  async update(claim: Claim): Promise<void> {
    await this.save(claim);
  }

  async delete(id: string): Promise<void> {
    await this.claimModel.deleteOne({ _id: id }).exec();
  }
}
