import { Observable } from 'rxjs';
import { Claim, Damage } from '../models/claim.model';
import { ClaimStatus } from '../models/claim-status.enum';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

export abstract class ClaimRepository {
  abstract getClaims(limit?: number, offset?: number): Observable<PaginatedResult<Claim>>;
  abstract getDamages(
    claimId: string,
    limit?: number,
    offset?: number,
  ): Observable<PaginatedResult<Damage>>;
  abstract getClaimById(id: string): Observable<Claim>;
  abstract createClaim(claim: { title: string; description: string }): Observable<Claim>;
  abstract updateClaim(
    id: string,
    claim: { title: string; description: string },
  ): Observable<Claim>;
  abstract addDamage(claimId: string, damage: Omit<Damage, 'id'>): Observable<Claim>;
  abstract updateDamage(
    claimId: string,
    damageId: string,
    damage: Partial<Omit<Damage, 'id'>>,
  ): Observable<Claim>;
  abstract deleteDamage(claimId: string, damageId: string): Observable<Claim>;
  abstract updateStatus(id: string, status: ClaimStatus): Observable<Claim>;
}
