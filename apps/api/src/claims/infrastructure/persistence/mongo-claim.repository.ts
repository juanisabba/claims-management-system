import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ClaimDocument } from './schemas/claim.schema';
import {
  IClaimRepository,
  ClaimFilters,
} from '../../domain/repositories/claim.repository.interface';
import { Claim } from '../../domain/entities/claim.entity';
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

  async findAll(filters: ClaimFilters): Promise<Claim[]> {
    const documents = await this.claimModel.find(filters).lean().exec();

    return documents.map((doc) => {
      const rawClaim = doc as unknown as RawClaim;
      return ClaimMapper.toDomain(rawClaim);
    });
  }
  async update(claim: Claim): Promise<void> {
    await this.save(claim);
  }

  async delete(id: string): Promise<void> {
    await this.claimModel.deleteOne({ _id: id }).exec();
  }
}
