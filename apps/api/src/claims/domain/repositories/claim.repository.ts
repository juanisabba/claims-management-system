import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Claim } from '../entities/claim.entity';
import { IClaimRepository } from './claim.repository.interface';
import { ClaimDocument } from 'src/claims/infrastructure/persistence/schemas/claim.schema';
import {
  ClaimMapper,
  RawClaim,
} from 'src/claims/infrastructure/persistence/mappers/claim.mapper';

@Injectable()
export class ClaimRepository implements IClaimRepository {
  constructor(
    @InjectModel('Claim') private readonly claimModel: Model<ClaimDocument>,
  ) {}

  async findById(id: string): Promise<Claim | null> {
    // Usamos RawClaim para que coincida con el parámetro de toDomain
    const doc = await this.claimModel.findById(id).lean<RawClaim>().exec();
    if (!doc) return null;
    return ClaimMapper.toDomain(doc);
  }

  async save(claim: Claim): Promise<void> {
    const persistenceModel = ClaimMapper.toPersistence(claim);
    await this.claimModel
      .findByIdAndUpdate(
        persistenceModel._id,
        { $set: persistenceModel },
        { upsert: true, new: true },
      )
      .exec();
  }

  async update(claim: Claim): Promise<void> {
    await this.save(claim);
  }

  async delete(id: string): Promise<void> {
    await this.claimModel.findByIdAndDelete(id).exec();
  }

  async findAll(filters: any): Promise<Claim[]> {
    const docs = await this.claimModel.find(filters).lean<RawClaim[]>().exec();

    return docs.map((doc) => ClaimMapper.toDomain(doc));
  }
}
