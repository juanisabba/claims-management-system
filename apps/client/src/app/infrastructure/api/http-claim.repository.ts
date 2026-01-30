import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { ClaimRepository, PaginatedResult } from '../../core/repositories/claim.repository';
import { Claim, Damage } from '../../core/models/claim.model';
import { ClaimStatus } from '../../core/models/claim-status.enum';
import { ClaimMapper } from './mappers/claim.mapper';

@Injectable()
export class HttpClaimRepository implements ClaimRepository {
  private readonly apiUrl = 'http://localhost:3000/api/v1/claims';

  constructor(private http: HttpClient) {}

  getClaims(limit: number = 10, offset: number = 0): Observable<PaginatedResult<Claim>> {
    return this.http
      .get<any>(this.apiUrl, {
        params: { limit: limit.toString(), offset: offset.toString() },
      })
      .pipe(
        map((response) => ({
          ...response,
          data: response.data.map(ClaimMapper.fromApi),
        })),
        catchError(this.handleError),
      );
  }

  getDamages(
    claimId: string,
    limit: number = 5,
    offset: number = 0,
  ): Observable<PaginatedResult<Damage>> {
    return this.http
      .get<any>(`${this.apiUrl}/${claimId}/damages`, {
        params: { limit: limit.toString(), offset: offset.toString() },
      })
      .pipe(
        map((response) => ({
          ...response,
          data: response.data.map((d: any) => ({
            id: d.id,
            part: d.part,
            severity: d.severity,
            imageUrl: d.imageUrl,
            price: d.price,
          })),
        })),
        catchError(this.handleError),
      );
  }

  getClaimById(id: string): Observable<Claim> {
    return this.http
      .get<any>(`${this.apiUrl}/${id}`)
      .pipe(map(ClaimMapper.fromApi), catchError(this.handleError));
  }

  createClaim(claim: { title: string; description: string }): Observable<Claim> {
    return this.http
      .post<any>(this.apiUrl, claim)
      .pipe(map(ClaimMapper.fromApi), catchError(this.handleError));
  }

  updateClaim(id: string, claim: { title: string; description: string }): Observable<Claim> {
    return this.http
      .patch<any>(`${this.apiUrl}/${id}`, claim)
      .pipe(map(ClaimMapper.fromApi), catchError(this.handleError));
  }

  addDamage(claimId: string, damage: Omit<Damage, 'id'>): Observable<Claim> {
    return this.http
      .post<any>(`${this.apiUrl}/${claimId}/damages`, damage)
      .pipe(map(ClaimMapper.fromApi), catchError(this.handleError));
  }

  updateDamage(
    claimId: string,
    damageId: string,
    damage: Partial<Omit<Damage, 'id'>>,
  ): Observable<Claim> {
    return this.http
      .patch<any>(`${this.apiUrl}/${claimId}/damages/${damageId}`, damage)
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
