import { Component, OnInit, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ClaimsStore } from '../../services/claims.store';
import { DamageListComponent } from '../../components/damage-list/damage-list.component';
import { DamageFormComponent } from '../../components/damage-form/damage-form.component';
import { ClaimStatus } from '../../../../core/models/claim-status.enum';
import { Damage, Claim, Severity } from '../../../../core/models/claim.model';
import { ModalComponent } from '../../components/modal/modal.component';
import { NoWhitespaceValidator } from '../../../../shared/validators/whitespace.validator';

@Component({
  selector: 'app-claim-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    DamageListComponent,
    DamageFormComponent,
    ModalComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './claim-detail.component.html',
})
export class ClaimDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  protected readonly store = inject(ClaimsStore);
  private fb = inject(FormBuilder);

  isDamageModalOpen = signal(false);
  editingDamage = signal<Damage | null>(null);

  isEditClaimModalOpen = signal(false);
  claimForm = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3), NoWhitespaceValidator()]],
    description: ['', [Validators.required, Validators.minLength(10), NoWhitespaceValidator()]],
  });

  isStatusModalOpen = signal(false);
  pendingStatus = signal<ClaimStatus | null>(null);

  isDeleteDamageModalOpen = signal(false);
  damageIdToDelete = signal<string | null>(null);

  statusControl = new FormControl<ClaimStatus | null>(null);

  ClaimStatus = ClaimStatus;
  protected readonly claimStatuses = [
    ClaimStatus.Pending,
    ClaimStatus.InReview,
    ClaimStatus.Finished,
  ];

  constructor() {
    effect(() => {
      const claim = this.store.currentClaim();
      if (claim) {
        this.statusControl.setValue(claim.status, { emitEvent: false });
        if (claim.status === ClaimStatus.Finished) {
          this.statusControl.disable({ emitEvent: false });
        } else {
          this.statusControl.enable({ emitEvent: false });
        }
      }
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.store.loadClaim(id);
  }

  openEditClaimModal(claim: Claim) {
    this.claimForm.patchValue({
      title: claim.title,
      description: claim.description,
    });
    this.isEditClaimModalOpen.set(true);
  }

  closeEditClaimModal() {
    this.isEditClaimModalOpen.set(false);
  }

  async onClaimSubmit() {
    const claim = this.store.claim();
    if (this.claimForm.valid && claim) {
      const data = this.claimForm.value as { title: string; description: string };
      await this.store.updateClaim(claim.id, data);
      this.closeEditClaimModal();
    }
  }

  openAddDamageModal() {
    this.editingDamage.set(null);
    this.isDamageModalOpen.set(true);
  }

  openEditDamageModal(damage: Damage) {
    this.editingDamage.set(damage);
    this.isDamageModalOpen.set(true);
  }

  closeDamageModal() {
    this.isDamageModalOpen.set(false);
    this.editingDamage.set(null);
  }

  async onDamageSubmit(damageData: Omit<Damage, 'id'>) {
    if (this.store.claim()?.status !== ClaimStatus.Pending) {
      this.closeDamageModal();
      return;
    }

    const damageId = this.editingDamage()?.id;
    if (damageId) {
      await this.store.updateDamage(damageId, damageData);
    } else {
      await this.store.addDamage(damageData);
    }
    this.closeDamageModal();
  }

  onDeleteDamage(damageId: string): void {
    if (this.store.claim()?.status !== ClaimStatus.Pending) return;
    this.damageIdToDelete.set(damageId);
    this.isDeleteDamageModalOpen.set(true);
  }

  cancelDeleteDamage(): void {
    this.isDeleteDamageModalOpen.set(false);
    this.damageIdToDelete.set(null);
  }

  async confirmDeleteDamage(): Promise<void> {
    const damageId = this.damageIdToDelete();
    if (damageId) {
      await this.store.deleteDamage(damageId);
      this.cancelDeleteDamage();
    }
  }

  onStatusChange(): void {
    const newStatus = this.statusControl.value;
    const currentStatus = this.store.claim()?.status;

    if (newStatus && newStatus !== currentStatus) {
      this.pendingStatus.set(newStatus);
      this.isStatusModalOpen.set(true);
      // Revert select temporarily until confirmed
      if (currentStatus) {
        this.statusControl.setValue(currentStatus, { emitEvent: false });
      }
    }
  }

  cancelStatusChange(): void {
    this.isStatusModalOpen.set(false);
    this.pendingStatus.set(null);
  }

  async confirmStatusChange(): Promise<void> {
    const status = this.pendingStatus();
    if (status) {
      await this.store.updateStatus(status);
      this.cancelStatusChange();
    }
  }

  canTransitionToFinished(): boolean {
    const claim = this.store.claim();
    if (!claim) return false;

    if (this.pendingStatus() === ClaimStatus.Finished) {
      const hasHighSeverity = claim.damages.some((d) => d.severity === Severity.HIGH);
      if (hasHighSeverity) {
        return claim.description.length > 100;
      }
    }
    return true;
  }

  canFinish(claim: Claim): boolean {
    const hasHighSeverity = claim.damages.some((d) => d.severity === Severity.HIGH);
    if (hasHighSeverity) {
      return claim.description.length > 100;
    }
    return true;
  }
}
