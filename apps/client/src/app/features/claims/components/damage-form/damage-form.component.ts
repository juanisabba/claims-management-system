import { Component, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Severity } from '../../../../core/models/claim.model';
import { ClaimStatus } from '../../../../core/models/claim-status.enum';

@Component({
  selector: 'app-damage-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './damage-form.component.html',
})
export class DamageFormComponent {
  private fb = inject(FormBuilder);

  claimStatus = input.required<ClaimStatus>();
  addDamage = output<any>();

  severities = Object.values(Severity);

  form = this.fb.nonNullable.group({
    part: ['', Validators.required],
    severity: [Severity.LOW, Validators.required],
    price: [0, [Validators.required, Validators.min(0)]],
    imageUrl: ['', [Validators.required, Validators.pattern(/https?:\/\/.+/)]],
  });

  isDisabled() {
    return this.claimStatus() !== ClaimStatus.Pending;
  }

  onSubmit() {
    if (this.form.valid) {
      this.addDamage.emit(this.form.getRawValue());
      this.form.reset({
        part: '',
        severity: Severity.LOW,
        price: 0,
        imageUrl: '',
      });
    }
  }
}
