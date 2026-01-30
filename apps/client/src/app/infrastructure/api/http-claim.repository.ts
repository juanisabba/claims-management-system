import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { ClaimRepository } from '../../core/repositories/claim.repository';
import { Claim, Damage } from '../../core/models/claim.model';
import { ClaimStatus } from '../../core/models/claim-status.enum';
import { ClaimMapper } from './mappers/claim.mapper';

@Injectable()
export class HttpClaimRepository implements ClaimRepository {
  private readonly apiUrl = 'http://localhost:3000/api/v1/claims';

  constructor(private http: HttpClient) {}

  getClaims(): Observable<Claim[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map((claims) => claims.map(ClaimMapper.fromApi)),
      catchError(this.handleError),
    );
  }

  getClaimById(id: string): Observable<Claim> {
    return this.http
      .get<any>(`${this.apiUrl}/${id}`)
      .pipe(map(ClaimMapper.fromApi), catchError(this.handleError));
  }

  addDamage(claimId: string, damage: Omit<Damage, 'id'>): Observable<Claim> {
    return this.http
      .post<any>(`${this.apiUrl}/${claimId}/damages`, damage)
      .pipe(map(ClaimMapper.fromApi), catchError(this.handleError));
  }

  deleteDamage(claimId: string, damageId: string): Observable<Claim> {
    return this.http
      .delete<any>(`${this.apiUrl}/${claimId}/damages/${damageId}`)
      .pipe(map(ClaimMapper.fromApi), catchError(this.handleError));
  }

  updateStatus(id: string, status: ClaimStatus): Observable<Claim> {
    return this.http
      .patch<any>(`${this.apiUrl}/${id}`, { status })
      .pipe(map(ClaimMapper.fromApi), catchError(this.handleError));
  }

  private handleError(error: any) {
    console.error('HTTP Error:', error);
    return throwError(() => new Error('Backend is offline or unreachable'));
  }
}
