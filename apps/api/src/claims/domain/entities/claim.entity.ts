import { ClaimStatus } from '../value-objects/claim-status.enum';
import { Damage } from './damage.entity';
import { ClaimStatusState } from '../states/claim-status.state';
import { PendingState } from '../states/pending.state';
import { InReviewState } from '../states/in-review.state';
import { FinishedState } from '../states/finished.state';

export class Claim {
  readonly id: string;
  title: string;
  description: string;
  status: ClaimStatus;
  private _damages: Damage[];
  private state: ClaimStatusState;

  constructor(
    id: string,
    title: string,
    description: string,
    status: ClaimStatus = ClaimStatus.Pending,
    damages: Damage[] = [],
  ) {
    this.id = id;
    this.title = title; // Initialize title
    this.description = description;
    this.status = status;
    this._damages = damages;
    this.state = this.mapStatusToState(status);
  }

  get totalAmount(): number {
    return this._damages.reduce((sum, damage) => sum + damage.price, 0);
  }

  get damages(): Damage[] {
    return [...this._damages];
  }

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
