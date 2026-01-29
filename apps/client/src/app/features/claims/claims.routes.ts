import { Routes } from '@angular/router';
import { ClaimDetailComponent } from './pages/claim-detail/claim-detail.component';

export const claimsRoutes: Routes = [
  {
    path: ':id',
    component: ClaimDetailComponent,
  },
];
