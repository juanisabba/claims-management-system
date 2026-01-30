import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ClaimsStore } from '../../services/claims.store';
import { DamageFormComponent } from '../../components/damage-form/damage-form.component';
import { DamageListComponent } from '../../components/damage-list/damage-list.component';
import { Damage, Claim, Severity } from '../../../../core/models/claim.model';
import { ClaimStatus } from '../../../../core/models/claim-status.enum';

@Component({
  selector: 'app-claim-detail',
  standalone: true,
  imports: [CommonModule, DamageFormComponent, DamageListComponent],
  templateUrl: './claim-detail.component.html',
})
export class ClaimDetailComponent implements OnInit {
  store = inject(ClaimsStore);
  route = inject(ActivatedRoute);

  ClaimStatus = ClaimStatus;

  constructor() {
    console.log('Claim Detail Initialized');
  }

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      this.store.loadClaim(id);
    });
  }

  onAddDamage(damage: Omit<Damage, 'id'>) {
    this.store.addDamage(damage);
  }

  canFinish(claim: Claim): boolean {
    const hasHighSeverity = claim.damages.some((d) => d.severity === Severity.HIGH);
    if (hasHighSeverity) {
      return claim.description.length > 100;
    }
    return true;
  }

  onFinish() {
    this.store.updateStatus(ClaimStatus.Finished);
  }
}
