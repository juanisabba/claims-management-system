import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Claim, Damage, Severity } from '../../../core/models/claim.model';
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

  async createClaim(data: { title: string; description: string }): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);
    try {
      const newClaim = await firstValueFrom(this.repository.createClaim(data));
      this.allClaims.update((claims) => [...claims, newClaim]);
    } catch (err) {
      this.error.set('Failed to create claim');
      console.error(err);
    } finally {
      this.isLoading.set(false);
    }
  }

  async updateClaim(id: string, data: { title: string; description: string }): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);
    try {
      const updatedClaim = await firstValueFrom(this.repository.updateClaim(id, data));
      this.allClaims.update((claims) =>
        claims.map((c) => (c.id === updatedClaim.id ? updatedClaim : c)),
      );
      if (this.claim()?.id === id) {
        this.claim.set(updatedClaim);
      }
    } catch (err) {
      this.error.set('Failed to update claim');
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

    if (currentClaim.status !== ClaimStatus.Pending) {
      this.error.set('Damages can only be added to claims in Pending status');
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

  async updateDamage(damageId: string, damage: Partial<Omit<Damage, 'id'>>): Promise<void> {
    const currentClaim = this.claim();
    if (!currentClaim) {
      this.error.set('No claim loaded');
      return;
    }

    if (currentClaim.status !== ClaimStatus.Pending) {
      this.error.set('Damages can only be updated for claims in Pending status');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);
    try {
      const updatedClaim = await firstValueFrom(
        this.repository.updateDamage(currentClaim.id, damageId, damage),
      );
      this.claim.set(updatedClaim);
    } catch (err) {
      this.error.set('Failed to update damage');
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

    if (currentClaim.status !== ClaimStatus.Pending) {
      this.error.set('Damages can only be deleted from claims in Pending status');
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

    // BR-06: Finished status transition validation
    if (status === ClaimStatus.Finished) {
      const hasHighSeverity = currentClaim.damages.some((d) => d.severity === Severity.HIGH);
      if (hasHighSeverity && currentClaim.description.length <= 100) {
        // Validation now handled in the confirmation modal, but keeping as a safety check
        this.error.set(
          'For claims with high severity damages, the description must exceed 100 characters before finishing.',
        );
        return;
      }
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
