import { Claim } from 'src/claims/domain/entities/claim.entity';
import type { IClaimRepository } from 'src/claims/domain/repositories/claim.repository.interface';
import { ClaimStatus } from 'src/claims/domain/value-objects/claim-status.enum';
import { ClaimNotFoundException } from '../exceptions/claim-not-found.exception';

export class TransitionStatusUseCase {
  constructor(private readonly claimRepository: IClaimRepository) {}

  async execute(claimId: string, targetStatus: ClaimStatus): Promise<Claim> {
    const claim = await this.claimRepository.findById(claimId);

    if (!claim) {
      throw new ClaimNotFoundException(`Claim with ID ${claimId} not found.`);
    }

    claim.transitionTo(targetStatus);

    await this.claimRepository.save(claim);

    return claim;
  }
}
