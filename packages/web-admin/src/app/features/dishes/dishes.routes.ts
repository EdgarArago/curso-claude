import type { Routes } from '@angular/router'

export const DISH_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/dish-list/dish-list.component').then(m => m.DishListComponent)
  },
  {
    path: 'new',
    loadComponent: () => import('./pages/dish-form/dish-form.component').then(m => m.DishFormComponent)
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./pages/dish-form/dish-form.component').then(m => m.DishFormComponent)
  }
]
