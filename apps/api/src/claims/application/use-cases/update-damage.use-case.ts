import { ClaimNotFoundException } from '../exceptions/claim-not-found.exception';
import { UpdateDamageDto } from '../dtos/update-damage.dto';
import { Claim } from 'src/claims/domain/entities/claim.entity';
import { IClaimRepository } from 'src/claims/domain/repositories/claim.repository.interface';
import { Damage } from 'src/claims/domain/entities/damage.entity';
import { DomainError } from 'src/claims/domain/errors/domain-error';
import { ClaimStatus } from 'src/claims/domain/value-objects/claim-status.enum';

export class UpdateDamageUseCase {
  constructor(private readonly claimRepository: IClaimRepository) {}

  async execute(
    claimId: string,
    damageId: string,
    dto: UpdateDamageDto,
  ): Promise<Claim> {
    const claim = await this.claimRepository.findById(claimId);

    if (!claim) {
      throw new ClaimNotFoundException(`Claim with ID ${claimId} not found.`);
    }

    if (claim.status !== ClaimStatus.Pending) {
      throw new DomainError(
        'Damages can only be updated when claim is Pending.',
      );
    }

    const currentDamage = claim.damages.find((d) => d.id === damageId);
    if (!currentDamage) {
      throw new DomainError(`Damage with ID ${damageId} not found.`);
    }

    const updatedDamage = new Damage(
      damageId,
      dto.part ?? currentDamage.part,
      dto.severity ?? currentDamage.severity,
      dto.imageUrl ?? currentDamage.imageUrl,
      dto.price ?? currentDamage.price,
    );

    claim.updateDamage(updatedDamage);

    await this.claimRepository.save(claim);

    return claim;
  }
}
