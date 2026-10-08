import { inject } from '@angular/core'
import type { HttpInterceptorFn } from '@angular/common/http'
import { AuthStore } from '../auth/auth.store'

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthStore).token()
  if (!token) return next(req)

  return next(req.clone({
    setHeaders: { Authorization: `Bearer ${token}` }
  }))
}
