import { CommonModule } from '@angular/common';
import { Component, OnInit, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ClaimsStore } from '../../services/claims.store';
import { ModalComponent } from '../../components/modal/modal.component';
import { Claim, ClaimSummary } from '../../../../core/models/claim.model';
import { NoWhitespaceValidator } from '../../../../shared/validators/whitespace.validator';

@Component({
  selector: 'app-claim-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent],
  templateUrl: './claim-list.component.html',
})
export class ClaimListComponent implements OnInit {
  protected readonly store = inject(ClaimsStore);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  protected readonly Math = Math;

  isModalOpen = signal(false);
  editingClaim = signal<ClaimSummary | null>(null);

  claimForm = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3), NoWhitespaceValidator()]],
    description: ['', [Validators.required, Validators.minLength(10), NoWhitespaceValidator()]],
  });

  constructor() {
    effect(() => {
      const page = this.store.currentClaimsPage();
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { page },
        queryParamsHandling: 'merge',
      });
    });
  }

  ngOnInit(): void {
    const pageParam = this.route.snapshot.queryParamMap.get('page');
    const page = pageParam ? parseInt(pageParam, 10) : 1;
    const offset = (page - 1) * this.store.claimsLimit();

    this.store.claimsOffset.set(offset);
    this.store.loadAllClaims();
  }

  openCreateModal() {
    this.editingClaim.set(null);
    this.claimForm.reset();
    this.isModalOpen.set(true);
  }

  openEditModal(claim: ClaimSummary) {
    this.editingClaim.set(claim);
    this.claimForm.patchValue({
      title: claim.title,
      description: claim.description,
    });
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.editingClaim.set(null);
    this.claimForm.reset();
  }

  async onSubmit() {
    if (this.claimForm.valid) {
      const data = this.claimForm.value as { title: string; description: string };
      const claimId = this.editingClaim()?.id;

      if (claimId) {
        await this.store.updateClaim(claimId, data);
      } else {
        await this.store.createClaim(data);
      }

      this.closeModal();
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'In Review':
        return 'bg-blue-100 text-blue-800';
      case 'Finished':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  navigateToDetail(claimId: string): void {
    this.router.navigate(['/claims', claimId]);
  }
}
