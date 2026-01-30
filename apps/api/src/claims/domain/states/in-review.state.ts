/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Claim } from '../entities/claim.entity';
import { Damage } from '../entities/damage.entity';
import { ClaimStatusState } from './claim-status.state';
import { ClaimStatus } from '../value-objects/claim-status.enum';
import { SeverityEnum } from '../value-objects/severity.enum';
import { DomainError } from '../errors/domain-error';
import { PendingState } from './pending.state';
import { FinishedState } from './finished.state';

export class InReviewState implements ClaimStatusState {
  // BR-02: Damage mutations are not allowed while in review
  addDamage(claim: Claim, damage: Damage): void {
    throw new DomainError(
      'BR-02: Damage management is blocked while the claim is "In Review".',
    );
  }

  removeDamage(claim: Claim, damageId: string): void {
    throw new DomainError(
      'BR-02: Damage management is blocked while the claim is "In Review".',
    );
  }

  updateDamage(claim: Claim, damage: Damage): void {
    throw new DomainError(
      'BR-02: Damage management is blocked while the claim is "In Review".',
    );
  }

  transitionTo(claim: Claim, status: ClaimStatus): void {
    // Allow returning to Pending for adjustments (according to 05-state-machine.md)
    if (status === ClaimStatus.Pending) {
      claim.internalSetStatus(ClaimStatus.Pending, new PendingState());
      return;
    }

    // Transition to Finished with BR-06 guard validation
    if (status === ClaimStatus.Finished) {
      claim.validateFinishRules();
      claim.internalSetStatus(ClaimStatus.Finished, new FinishedState());
      return;
    }

    throw new DomainError(`Cannot transition from In Review to ${status}.`);
  }
}
