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
  // BR-02: En revisión no se permiten mutaciones de daños
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
    // Permitir volver a Pending para ajustes (según 05-state-machine.md)
    if (status === ClaimStatus.Pending) {
      claim.internalSetStatus(ClaimStatus.Pending, new PendingState());
      return;
    }

    // Transición a Finished con validación de guarda BR-06
    if (status === ClaimStatus.Finished) {
      this.validateCompletionGuard(claim);
      claim.internalSetStatus(ClaimStatus.Finished, new FinishedState());
      return;
    }

    throw new DomainError(`Cannot transition from In Review to ${status}.`);
  }

  /**
   * BR-06: Guard validation for Finishing.
   * If any damage is "high", description must be > 100 chars.
   */
  private validateCompletionGuard(claim: Claim): void {
    // Usamos el valor del enum directamente según tu implementación de Severity
    const hasHighSeverity = claim.damages.some(
      (d) => d.severity === SeverityEnum.HIGH,
    );

    if (hasHighSeverity && claim.description.length <= 100) {
      throw new DomainError(
        'BR-06: High impact claims require a detailed description (over 100 characters) before closing.',
      );
    }
  }
}
