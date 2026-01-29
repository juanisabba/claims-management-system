import { ClaimStatus } from '../value-objects/claim-status.enum';
import { Damage } from './damage.entity';
import { ClaimStatusState } from '../states/claim-status.state';
import { PendingState } from '../states/pending.state';
import { InReviewState } from '../states/in-review.state';
import { FinishedState } from '../states/finished.state';

export class Claim {
  readonly id: string;
  description: string;
  status: ClaimStatus;
  damages: Damage[];
  private state: ClaimStatusState;

  constructor(
    id: string,
    description: string,
    status: ClaimStatus = ClaimStatus.Pending,
    damages: Damage[] = [],
  ) {
    this.id = id;
    this.description = description;
    this.status = status;
    this.damages = damages;
    // Inicializamos el objeto de estado según el status que recibimos
    this.state = this.mapStatusToState(status);
  }

  // Helper para asegurar que el objeto de estado coincida con el status (rehidratación)
  private mapStatusToState(status: ClaimStatus): ClaimStatusState {
    switch (status) {
      case ClaimStatus.InReview:
        return new InReviewState();
      case ClaimStatus.Finished:
        return new FinishedState();
      default:
        return new PendingState();
    }
  }

  // --- Public methods (Delegados al estado) ---
  addDamage(damage: Damage): void {
    this.state.addDamage(this, damage);
  }

  removeDamage(damageId: string): void {
    this.state.removeDamage(this, damageId);
  }

  updateDamage(damage: Damage): void {
    this.state.updateDamage(this, damage);
  }

  transitionTo(status: ClaimStatus): void {
    this.state.transitionTo(this, status);
  }

  // --- Internal methods (Solo llamados por los objetos State) ---
  internalAddDamage(damage: Damage): void {
    this.damages.push(damage);
  }

  internalRemoveDamage(damageId: string): void {
    this.damages = this.damages.filter((d) => d.id !== damageId);
  }

  internalUpdateDamage(damage: Damage): void {
    const index = this.damages.findIndex((d) => d.id === damage.id);
    if (index > -1) {
      this.damages[index] = damage;
    }
  }

  internalSetStatus(status: ClaimStatus, state: ClaimStatusState): void {
    this.status = status;
    this.state = state;
  }
}
