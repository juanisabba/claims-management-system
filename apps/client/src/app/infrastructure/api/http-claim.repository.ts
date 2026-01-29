import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ClaimRepository } from '../../core/repositories/claim.repository';
import { Claim, Damage } from '../../core/models/claim.model';
import { ClaimStatus } from '../../core/models/claim-status.enum';

@Injectable()
export class HttpClaimRepository implements ClaimRepository {
  private readonly apiUrl = 'http://localhost:3000/api/v1/claims';

  constructor(private http: HttpClient) {}

  getClaims(): Observable<Claim[]> {
    return this.http.get<Claim[]>(this.apiUrl);
  }

  getClaimById(id: string): Observable<Claim> {
    return this.http.get<Claim>(`${this.apiUrl}/${id}`);
  }

  addDamage(claimId: string, damage: Omit<Damage, 'id'>): Observable<Claim> {
    return this.http.post<Claim>(`${this.apiUrl}/${claimId}/damages`, damage);
  }

  deleteDamage(claimId: string, damageId: string): Observable<Claim> {
    return this.http.delete<Claim>(`${this.apiUrl}/${claimId}/damages/${damageId}`);
  }

  updateStatus(id: string, status: ClaimStatus): Observable<Claim> {
    return this.http.patch<Claim>(`${this.apiUrl}/${id}`, { status });
  }
}
