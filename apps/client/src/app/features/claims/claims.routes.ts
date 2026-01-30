import { Routes } from '@angular/router';
import { ClaimListComponent } from './pages/claim-list/claim-list.component';
import { ClaimDetailComponent } from './pages/claim-detail/claim-detail.component';

export const claimsRoutes: Routes = [
  {
    path: '',
    component: ClaimListComponent,
  },
  {
    path: ':id',
    component: ClaimDetailComponent,
  },
];
