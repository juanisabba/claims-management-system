import type { Claim } from '../entities/claim.entity';
import { Damage } from '../entities/damage.entity';
import { ClaimStatusState } from './claim-status.state';
import { ClaimStatus } from '../value-objects/claim-status.enum';
import { DomainError } from '../errors/domain-error';
import { InReviewState } from './in-review.state';
import { FinishedState } from './finished.state';

export class PendingState implements ClaimStatusState {
  addDamage(claim: Claim, damage: Damage): void {
    const exists = claim.damages.some((d) => d.id === damage.id);
    if (exists) {
      throw new DomainError(
        `Damage with ID ${damage.id} already exists in this claim.`,
      );
    }

    claim.internalAddDamage(damage);
  }

  removeDamage(claim: Claim, damageId: string): void {
    const exists = claim.damages.some((d) => d.id === damageId);
    if (!exists) {
      throw new DomainError(`Damage with ID ${damageId} not found.`);
    }
    claim.internalRemoveDamage(damageId);
  }

  updateDamage(claim: Claim, damage: Damage): void {
    const index = claim.damages.findIndex((d) => d.id === damage.id);
    if (index === -1) {
      throw new DomainError(
        `Cannot update: Damage with ID ${damage.id} not found.`,
      );
    }
    claim.internalUpdateDamage(damage);
  }

  transitionTo(claim: Claim, status: ClaimStatus): void {
    if (status === ClaimStatus.InReview) {
      claim.internalSetStatus(ClaimStatus.InReview, new InReviewState());
      return;
    }
    if (status === ClaimStatus.Finished) {
      claim.validateFinishRules();

      // Si la validación anterior falla, lanza una excepción y no llega aquí
      claim.internalSetStatus(ClaimStatus.Finished, new FinishedState());
      return;
    }

    throw new DomainError(`Cannot transition from Pending to ${status}.`);
  }
}
