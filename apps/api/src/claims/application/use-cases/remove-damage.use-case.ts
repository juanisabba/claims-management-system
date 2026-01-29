import { ClaimNotFoundException } from '../exceptions/claim-not-found.exception';
import { IClaimRepository } from 'src/claims/domain/repositories/claim.repository.interface';
import { ClaimStatus } from 'src/claims/domain/value-objects/claim-status.enum';
import { DomainError } from 'src/claims/domain/errors/domain-error';
import { Claim } from 'src/claims/domain/entities/claim.entity';

export class RemoveDamageUseCase {
  constructor(private readonly claimRepository: IClaimRepository) {}

  async execute(claimId: string, damageId: string): Promise<Claim> {
    const claim = await this.claimRepository.findById(claimId);

    if (!claim) {
      throw new ClaimNotFoundException(`Claim with ID ${claimId} not found.`);
    }

    if (claim.status !== ClaimStatus.Pending) {
      throw new DomainError(
        'Damages can only be removed when claim is Pending.',
      );
    }

    claim.removeDamage(damageId);

    await this.claimRepository.save(claim);

    return claim;
  }
}
