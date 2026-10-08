import { Routes } from '@angular/router';
import { LoginComponent, RegisterComponent, authGuard } from '@resttek/web-shared';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: '',
    loadComponent: () => import('./core/layout/shell.component').then(m => m.ShellComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'restaurants', pathMatch: 'full' },
      {
        path: 'restaurants',
        loadComponent: () => import('./features/restaurants/restaurant-list.component').then(m => m.RestaurantListComponent)
      },
      {
        path: 'restaurants/:id',
        loadComponent: () => import('./features/menu/restaurant-menu.component').then(m => m.RestaurantMenuComponent)
      },
      {
        path: 'cart',
        loadComponent: () => import('./features/cart/cart.component').then(m => m.CartComponent)
      },
      {
        path: 'orders',
        loadComponent: () => import('./features/orders/my-orders.component').then(m => m.MyOrdersComponent)
      },
      {
        path: 'orders/:id',
        loadComponent: () => import('./features/orders/order-detail.component').then(m => m.OrderDetailComponent)
      }
    ]
  }
];
