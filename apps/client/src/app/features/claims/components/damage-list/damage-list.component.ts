import { Component, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Damage } from '../../../../core/models/claim.model';
import { ClaimStatus } from '../../../../core/models/claim-status.enum';
import { ClaimsStore } from '../../services/claims.store';

@Component({
  selector: 'app-damage-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './damage-list.component.html',
})
export class DamageListComponent {
  protected readonly store = inject(ClaimsStore);
  protected readonly Math = Math;
  damages = input.required<Damage[]>();
  claimStatus = input.required<ClaimStatus>();
  editDamage = output<Damage>();
  deleteDamage = output<string>();

  canEdit() {
    return this.claimStatus() === ClaimStatus.Pending;
  }

  getSeverityClass(severity: string): string {
    switch (severity.toLowerCase()) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'mid':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
}
