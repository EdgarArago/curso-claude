import { ApplicationConfig, provideZonelessChangeDetection, importProvidersFrom } from '@angular/core'
import { provideRouter } from '@angular/router'
import { provideHttpClient, withInterceptors } from '@angular/common/http'
import {
  LucideAngularModule,
  LayoutDashboard, Users, Utensils, Package, LogOut, Plus,
  Edit, Trash2, ChevronLeft, ChevronRight, Search, Menu, Settings, Store
} from 'lucide-angular'

import { routes } from './app.routes'
import { authInterceptor, errorInterceptor, API_URL } from '@resttek/web-shared'
import { environment } from '../environments/environment'

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: API_URL, useValue: environment.apiUrl },
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor, errorInterceptor])
    ),
    importProvidersFrom(
      LucideAngularModule.pick({
        LayoutDashboard, Users, Utensils, Package, LogOut, Plus,
        Edit, Trash2, ChevronLeft, ChevronRight, Search, Menu, Settings, Store
      })
    )
  ]
}
