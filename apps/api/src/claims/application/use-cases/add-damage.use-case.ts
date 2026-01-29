import { randomUUID } from 'crypto';
import { ClaimNotFoundException } from '../exceptions/claim-not-found.exception';
import { AddDamageDto } from '../dtos/add-damage.dto';
import { Claim } from 'src/claims/domain/entities/claim.entity';
import { IClaimRepository } from 'src/claims/domain/repositories/claim.repository.interface';
import { Damage } from 'src/claims/domain/entities/damage.entity';
import { Severity } from 'src/claims/domain/value-objects/severity.vo';

export class AddDamageUseCase {
  constructor(private readonly claimRepository: IClaimRepository) {}

  async execute(claimId: string, dto: AddDamageDto): Promise<Claim> {
    const claim = await this.claimRepository.findById(claimId);

    if (!claim) {
      throw new ClaimNotFoundException(`Claim with ID ${claimId} not found.`);
    }

    const damageId = randomUUID();
    const newDamage = new Damage(
      damageId,
      dto.part,
      dto.description,
      Severity.create(dto.severity),
      dto.imageUrl,
      dto.price,
    );

    // El método addDamage de la entidad Claim ya debería encargarse
    // de recalcular el totalAmount y validar el estado.
    claim.addDamage(newDamage);

    await this.claimRepository.save(claim);

    return claim;
  }
}
