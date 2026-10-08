import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  LucideAngularModule,
  Utensils, ShoppingCart, User, LogOut, Store, ClipboardList
} from 'lucide-angular'

import { routes } from './app.routes';
import { authInterceptor, errorInterceptor, API_URL } from '@resttek/web-shared';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: API_URL, useValue: environment.apiUrl },
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor, errorInterceptor])
    ),
    importProvidersFrom(
      LucideAngularModule.pick({
        Utensils, ShoppingCart, User, LogOut, Store, ClipboardList
      })
    )
  ]
};
