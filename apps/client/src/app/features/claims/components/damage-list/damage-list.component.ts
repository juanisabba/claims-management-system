import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Damage } from '../../../../core/models/claim.model';

@Component({
  selector: 'app-damage-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './damage-list.component.html',
})
export class DamageListComponent {
  damages = input.required<Damage[]>();
}
