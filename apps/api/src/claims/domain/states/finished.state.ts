/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Claim } from '../entities/claim.entity';
import { DomainError } from '../errors/domain-error';
import type { ClaimStatusState } from './claim-status.state';
import { ClaimStatus } from '../value-objects/claim-status.enum';
import { Damage } from '../entities/damage.entity';

export class FinishedState implements ClaimStatusState {
  // BR-01: El estado Finished es inmutable
  addDamage(claim: Claim, damage: Damage): void {
    throw new DomainError(
      'BR-01: Cannot add damage to a finished claim. The record is immutable.',
    );
  }

  removeDamage(claim: Claim, damageId: string): void {
    throw new DomainError(
      'BR-01: Cannot remove damage from a finished claim. The record is immutable.',
    );
  }

  updateDamage(claim: Claim, damage: Damage): void {
    throw new DomainError(
      'BR-01: Cannot update damage in a finished claim. The record is immutable.',
    );
  }

  // El ciclo de vida termina aquí, no hay más transiciones permitidas
  transitionTo(claim: Claim, status: ClaimStatus): void {
    throw new DomainError(
      `Cannot transition from Finished to ${status}. This is a final state.`,
    );
  }
}
