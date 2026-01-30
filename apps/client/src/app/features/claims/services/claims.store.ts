import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Claim, Damage, Severity } from '../../../core/models/claim.model';
import { ClaimStatus } from '../../../core/models/claim-status.enum';
import { ClaimRepository } from '../../../core/repositories/claim.repository';
import { ToastService } from '../../../core/services/toast.service';

@Injectable({
  providedIn: 'root',
})
export class ClaimsStore {
  private readonly repository = inject(ClaimRepository);
  private readonly toastService = inject(ToastService);

  // State
  readonly claim = signal<Claim | null>(null);
  readonly currentClaim = computed(() => this.claim());
  readonly allClaims = signal<Claim[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  // Pagination Claims
  readonly claimsLimit = signal<number>(10);
  readonly claimsOffset = signal<number>(0);
  readonly totalClaims = signal<number>(0);

  // Pagination Damages
  readonly damagesLimit = signal<number>(5);
  readonly damagesOffset = signal<number>(0);
  readonly totalDamages = signal<number>(0);
  readonly paginatedDamages = signal<Damage[]>([]);

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
      const response = await firstValueFrom(
        this.repository.getClaims(this.claimsLimit(), this.claimsOffset()),
      );
      this.allClaims.set(response.data);
      this.totalClaims.set(response.total);
    } catch (err) {
      this.error.set('Failed to load claims');
      this.allClaims.set([]);
      this.totalClaims.set(0);
      console.error(err);
    } finally {
      this.isLoading.set(false);
    }
  }

  async loadDamages(): Promise<void> {
    const currentClaim = this.claim();
    if (!currentClaim) return;

    this.isLoading.set(true);
    this.error.set(null);
    try {
      const response = await firstValueFrom(
        this.repository.getDamages(currentClaim.id, this.damagesLimit(), this.damagesOffset()),
      );
      this.paginatedDamages.set(response.data);
      this.totalDamages.set(response.total);
    } catch (err) {
      this.error.set('Failed to load damages');
      this.paginatedDamages.set([]);
      this.totalDamages.set(0);
      console.error(err);
    } finally {
      this.isLoading.set(false);
    }
  }

  async nextClaimsPage(): Promise<void> {
    const nextOffset = this.claimsOffset() + this.claimsLimit();
    if (nextOffset < this.totalClaims()) {
      this.claimsOffset.set(nextOffset);
      await this.loadAllClaims();
    }
  }

  async prevClaimsPage(): Promise<void> {
    const prevOffset = Math.max(0, this.claimsOffset() - this.claimsLimit());
    if (prevOffset !== this.claimsOffset()) {
      this.claimsOffset.set(prevOffset);
      await this.loadAllClaims();
    }
  }

  async nextDamagesPage(): Promise<void> {
    const nextOffset = this.damagesOffset() + this.damagesLimit();
    if (nextOffset < this.totalDamages()) {
      this.damagesOffset.set(nextOffset);
      await this.loadDamages();
    }
  }

  async prevDamagesPage(): Promise<void> {
    const prevOffset = Math.max(0, this.damagesOffset() - this.damagesLimit());
    if (prevOffset !== this.damagesOffset()) {
      this.damagesOffset.set(prevOffset);
      await this.loadDamages();
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
      this.damagesOffset.set(0);
      await this.loadDamages();
    } catch (err) {
      this.error.set('Failed to load claim');
      this.claim.set(null);
      console.error(err);
    } finally {
      this.isLoading.set(false);
    }
  }

  async createClaim(data: { title: string; description: string }): Promise<void> {
    if (!data.title?.trim() || !data.description?.trim()) {
      this.error.set('Title and description cannot be empty or only whitespace');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);
    try {
      await firstValueFrom(this.repository.createClaim(data));
      await this.loadAllClaims();
    } catch (err) {
      this.error.set('Failed to create claim');
      console.error(err);
    } finally {
      this.isLoading.set(false);
    }
  }

  async updateClaim(id: string, data: { title: string; description: string }): Promise<void> {
    if (!data.title?.trim() || !data.description?.trim()) {
      this.error.set('Title and description cannot be empty or only whitespace');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);
    try {
      const updatedClaim = await firstValueFrom(this.repository.updateClaim(id, data));
      await this.loadAllClaims();
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

    if (!damage.part?.trim() || damage.price <= 0) {
      this.error.set('Damage part cannot be empty and price must be greater than 0');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);
    try {
      const updatedClaim = await firstValueFrom(this.repository.addDamage(currentClaim.id, damage));
      this.claim.set(updatedClaim);
      await this.loadDamages();
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

    if (
      (damage.part !== undefined && !damage.part?.trim()) ||
      (damage.price !== undefined && damage.price <= 0)
    ) {
      this.error.set('Damage part cannot be empty and price must be greater than 0');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);
    try {
      const updatedClaim = await firstValueFrom(
        this.repository.updateDamage(currentClaim.id, damageId, damage),
      );
      this.claim.set(updatedClaim);
      await this.loadDamages();
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
      await firstValueFrom(this.repository.deleteDamage(currentClaim.id, damageId));

      // Update local state by removing the deleted damage
      if (currentClaim) {
        this.claim.set({
          ...currentClaim,
          damages: currentClaim.damages.filter((d) => d.id !== damageId),
        });
      }

      await this.loadDamages();
      this.toastService.success('Damage deleted successfully.');
    } catch (err) {
      this.error.set('Failed to delete damage');
      this.toastService.error('Failed to delete damage. Please try again.');
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
      await this.loadAllClaims();
    } catch (err) {
      this.error.set('Failed to update status');
      console.error(err);
    } finally {
      this.isLoading.set(false);
    }
  }
}
