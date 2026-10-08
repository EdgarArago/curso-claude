import { inject } from '@angular/core'
import { Router, type CanActivateFn } from '@angular/router'
import { AuthStore } from './auth.store'

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthStore)
  const router = inject(Router)

  if (auth.isAuthenticated()) return true
  return router.createUrlTree(['/login'])
}
