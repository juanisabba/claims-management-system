import { Inject, Injectable } from '@nestjs/common';
import type { IClaimRepository } from '../../domain/repositories/claim.repository.interface';
import { UpdateClaimDto } from '../dtos/update-claim.dto';
import { Claim } from '../../domain/entities/claim.entity';
import { ClaimNotFoundException } from '../exceptions/claim-not-found.exception';
import { ClaimStatus } from '../../domain/value-objects/claim-status.enum';
import { DomainError } from '../../domain/errors/domain-error';

@Injectable()
export class UpdateClaimUseCase {
  constructor(
    @Inject('IClaimRepository')
    private readonly claimRepository: IClaimRepository,
  ) {}

  async execute(id: string, dto: UpdateClaimDto): Promise<Claim> {
    const claim = await this.claimRepository.findById(id);
    if (!claim) {
      throw new ClaimNotFoundException(id);
    }

    if (dto.title) {
      claim.title = dto.title;
    }
    if (dto.description) {
      claim.description = dto.description;
    }

    if (dto.status && dto.status !== claim.status) {
      if (dto.status === ClaimStatus.Finished) {
        if (claim.description.length <= 100) {
          throw new DomainError(
            'Claim description must exceed 100 characters to be finished.',
          );
        }
        const hasHighSeverityDamage = claim.damages.some(
          (d) => d.severity.value === 'high',
        );
        if (!hasHighSeverityDamage) {
          throw new DomainError(
            'Claim must have at least one high severity damage to be finished.',
          );
        }
      }

      claim.transitionTo(dto.status);
    }

    await this.claimRepository.save(claim);
    return claim;
  }
}
