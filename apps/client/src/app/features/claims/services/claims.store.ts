import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Claim, Damage } from '../../../core/models/claim.model';
import { ClaimStatus } from '../../../core/models/claim-status.enum';
import { ClaimRepository } from '../../../core/repositories/claim.repository';

@Injectable({
  providedIn: 'root',
})
export class ClaimsStore {
  private readonly repository = inject(ClaimRepository);

  // State
  readonly claim = signal<Claim | null>(null);
  readonly allClaims = signal<Claim[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  // Computed
  readonly totalAmount = computed(() => {
    const currentClaim = this.claim();
    if (!currentClaim) return 0;
    return currentClaim.damages.reduce((sum, damage) => sum + damage.price, 0);
  });

  // Methods
  async loadAllClaims(): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);
    try {
      const claims = await firstValueFrom(this.repository.getClaims());
      this.allClaims.set(claims);
    } catch (err) {
      this.error.set('Failed to load claims');
      this.allClaims.set([]);
      console.error(err);
    } finally {
      this.isLoading.set(false);
    }
  }

  async loadClaim(id: string | null): Promise<void> {
    if (!id) {
      this.claim.set(null);
      this.error.set('No claim ID provided');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);
    try {
      const claim = await firstValueFrom(this.repository.getClaimById(id));
      this.claim.set(claim);
    } catch (err) {
      this.error.set('Failed to load claim');
      this.claim.set(null);
      console.error(err);
    } finally {
      this.isLoading.set(false);
    }
  }

  async addDamage(damage: Omit<Damage, 'id'>): Promise<void> {
    const currentClaim = this.claim();
    if (!currentClaim) {
      this.error.set('No claim loaded');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);
    try {
      const updatedClaim = await firstValueFrom(this.repository.addDamage(currentClaim.id, damage));
      this.claim.set(updatedClaim);
    } catch (err) {
      this.error.set('Failed to add damage');
      console.error(err);
    } finally {
      this.isLoading.set(false);
    }
  }

  async deleteDamage(damageId: string): Promise<void> {
    const currentClaim = this.claim();
    if (!currentClaim) {
      this.error.set('No claim loaded');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);
    try {
      const updatedClaim = await firstValueFrom(
        this.repository.deleteDamage(currentClaim.id, damageId),
      );
      this.claim.set(updatedClaim);
    } catch (err) {
      this.error.set('Failed to delete damage');
      console.error(err);
    } finally {
      this.isLoading.set(false);
    }
  }

  async updateStatus(status: ClaimStatus): Promise<void> {
    const currentClaim = this.claim();
    if (!currentClaim) {
      this.error.set('No claim loaded');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);
    try {
      const updatedClaim = await firstValueFrom(
        this.repository.updateStatus(currentClaim.id, status),
      );
      this.claim.set(updatedClaim);
    } catch (err) {
      this.error.set('Failed to update status');
      console.error(err);
    } finally {
      this.isLoading.set(false);
    }
  }
}
