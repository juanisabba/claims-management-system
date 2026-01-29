import { Observable } from 'rxjs';
import { Claim, Damage } from '../models/claim.model';
import { ClaimStatus } from '../models/claim-status.enum';

export abstract class ClaimRepository {
  abstract getClaims(): Observable<Claim[]>;
  abstract getClaimById(id: string): Observable<Claim>;
  abstract addDamage(claimId: string, damage: Omit<Damage, 'id'>): Observable<Claim>;
  abstract deleteDamage(claimId: string, damageId: string): Observable<Claim>;
  abstract updateStatus(id: string, status: ClaimStatus): Observable<Claim>;
}
