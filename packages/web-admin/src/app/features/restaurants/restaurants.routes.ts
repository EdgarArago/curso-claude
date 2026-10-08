import type { Routes } from '@angular/router'

export const RESTAURANT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/restaurant-list/restaurant-list.component').then(m => m.RestaurantListComponent)
  },
  {
    path: 'new',
    loadComponent: () => import('./pages/restaurant-form/restaurant-form.component').then(m => m.RestaurantFormComponent)
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./pages/restaurant-form/restaurant-form.component').then(m => m.RestaurantFormComponent)
  }
]
