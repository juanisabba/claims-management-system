import { Claim } from '../entities/claim.entity';
import { Damage } from '../entities/damage.entity';
import { ClaimStatus } from '../value-objects/claim-status.enum';

export interface ClaimStatusState {
  addDamage(claim: Claim, damage: Damage): void;
  removeDamage(claim: Claim, damageId: string): void;
  updateDamage(claim: Claim, damage: Damage): void;
  transitionTo(claim: Claim, status: ClaimStatus): void;
}
