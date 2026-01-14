import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./dashboard/user-dashboard/user-dashboard')
        .then(c => c.UserDashboardComponent)
  }
];
