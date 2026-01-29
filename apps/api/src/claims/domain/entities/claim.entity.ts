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
  private _damages: Damage[];
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
    this._damages = damages;
    // Initialize state object based on the provided status (Rehydration)
    this.state = this.mapStatusToState(status);
  }

  /**
   * BR-03: Calculated property for the total claim amount.
   */
  get totalAmount(): number {
    return this._damages.reduce((sum, damage) => sum + damage.price, 0);
  }

  /**
   * Returns a copy of the damages to maintain encapsulation.
   */
  get damages(): Damage[] {
    return [...this._damages];
  }

  // Helper to ensure the state object matches the status (Rehydration logic)
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

  // --- Public methods (Delegated to State) ---
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

  // --- Internal methods (Called by State objects ONLY) ---
  internalAddDamage(damage: Damage): void {
    this._damages.push(damage);
  }

  internalRemoveDamage(damageId: string): void {
    this._damages = this._damages.filter((d) => d.id !== damageId);
  }

  internalUpdateDamage(damage: Damage): void {
    const index = this._damages.findIndex((d) => d.id === damage.id);
    if (index > -1) {
      this._damages[index] = damage;
    }
  }

  internalSetStatus(status: ClaimStatus, state: ClaimStatusState): void {
    this.status = status;
    this.state = state;
  }
}
