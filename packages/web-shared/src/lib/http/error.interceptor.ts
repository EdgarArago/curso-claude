import { inject } from '@angular/core'
import type { HttpInterceptorFn } from '@angular/common/http'
import { catchError, throwError } from 'rxjs'
import { Router, NavigationExtras } from '@angular/router'
import { AuthStore } from '../auth/auth.store'

let isRedirecting = false

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router)
  const auth = inject(AuthStore)

  return next(req).pipe(
    catchError(error => {
      if (error.status === 401 && !isRedirecting) {
        const currentUrl = router.url
        if (currentUrl.includes('/login')) {
          auth.clearSession()
          return throwError(() => error)
        }
        
        isRedirecting = true
        auth.clearSession()
        
        const navigationExtras: NavigationExtras = { replaceUrl: true }
        router.navigate(['/login'], navigationExtras).finally(() => {
          setTimeout(() => { isRedirecting = false }, 1000)
        })
      }
      return throwError(() => error)
    })
  )
}
