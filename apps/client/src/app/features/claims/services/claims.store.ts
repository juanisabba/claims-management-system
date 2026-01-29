import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Claim, Damage } from '../../../core/models/claim.model';
import { ClaimRepository } from '../../../core/repositories/claim.repository';

@Injectable({
  providedIn: 'root',
})
export class ClaimsStore {
  private readonly repository = inject(ClaimRepository);

  // State
  readonly claim = signal<Claim | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  // Computed
  readonly totalAmount = computed(() => {
    const currentClaim = this.claim();
    if (!currentClaim) return 0;
    return currentClaim.damages.reduce((sum, damage) => sum + damage.price, 0);
  });

  // Methods
  async loadClaim(id: string): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);
    try {
      const claim = await firstValueFrom(this.repository.getClaimById(id));
      this.claim.set(claim);
    } catch (err) {
      this.error.set('Failed to load claim');
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
}
