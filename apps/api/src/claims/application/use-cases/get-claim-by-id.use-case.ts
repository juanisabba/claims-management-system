import { Inject, Injectable } from '@nestjs/common';
import type { IClaimRepository } from '../../domain/repositories/claim.repository.interface';
import { Claim } from '../../domain/entities/claim.entity';
import { ClaimNotFoundException } from '../exceptions/claim-not-found.exception';

@Injectable()
export class GetClaimByIdUseCase {
  constructor(
    @Inject('IClaimRepository')
    private readonly claimRepository: IClaimRepository,
  ) {}

  async execute(id: string): Promise<Claim> {
    const claim = await this.claimRepository.findById(id);
    if (!claim) {
      throw new ClaimNotFoundException(id);
    }
    return claim;
  }
}
