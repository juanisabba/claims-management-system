import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'claims', pathMatch: 'full' },
  {
    path: 'claims',
    loadChildren: () => import('./features/claims/claims.routes').then((m) => m.claimsRoutes),
  },
];
