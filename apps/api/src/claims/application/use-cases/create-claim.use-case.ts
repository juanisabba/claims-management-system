import { randomUUID } from 'crypto';
import { CreateClaimDto } from '../dtos/create-claim.dto';
import { Claim } from 'src/claims/domain/entities/claim.entity';
import { IClaimRepository } from 'src/claims/domain/repositories/claim.repository.interface';
import { Damage } from 'src/claims/domain/entities/damage.entity';
import { ClaimStatus } from 'src/claims/domain/value-objects/claim-status.enum';

export class CreateClaimUseCase {
  constructor(private readonly claimRepository: IClaimRepository) {}

  async execute(dto: CreateClaimDto): Promise<Claim> {
    const claimId = randomUUID();

    const damages: Damage[] = (dto.damages || []).map((damageDto) => {
      return new Damage(
        randomUUID(),
        damageDto.part,
        damageDto.severity,
        damageDto.imageUrl,
        damageDto.price,
      );
    });

    const newClaim = new Claim(
      claimId,
      dto.title,
      dto.description,
      ClaimStatus.Pending,
      damages,
    );

    await this.claimRepository.save(newClaim);

    return newClaim;
  }
}
