import { Component, input, output, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Damage, Severity } from '../../../../core/models/claim.model';
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
  initialData = input<Damage | null>(null);
  submitDamage = output<any>();
  cancel = output<void>();

  severities = Object.values(Severity);

  form = this.fb.nonNullable.group({
    part: ['', Validators.required],
    severity: [Severity.LOW, Validators.required],
    price: [0, [Validators.required, Validators.min(0)]],
    imageUrl: ['', [Validators.required, Validators.pattern(/https?:\/\/.+/)]],
  });

  constructor() {
    effect(() => {
      const data = this.initialData();
      if (data) {
        this.form.patchValue(data);
      } else {
        this.form.reset({
          part: '',
          severity: Severity.LOW,
          price: 0,
          imageUrl: '',
        });
      }
    });
  }

  isDisabled() {
    return this.claimStatus() !== ClaimStatus.Pending;
  }

  onSubmit() {
    if (this.form.valid) {
      this.submitDamage.emit(this.form.getRawValue());
      if (!this.initialData()) {
        this.form.reset({
          part: '',
          severity: Severity.LOW,
          price: 0,
          imageUrl: '',
        });
      }
    }
  }
}
