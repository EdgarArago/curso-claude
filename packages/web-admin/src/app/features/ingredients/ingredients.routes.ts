import type { Routes } from '@angular/router'

export const INGREDIENT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/ingredient-list/ingredient-list.component').then(m => m.IngredientListComponent)
  },
  {
    path: 'new',
    loadComponent: () => import('./pages/ingredient-form/ingredient-form.component').then(m => m.IngredientFormComponent)
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./pages/ingredient-form/ingredient-form.component').then(m => m.IngredientFormComponent)
  }
]
