import { Injectable, signal, computed } from '@angular/core'

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly _token = signal<string | null>(
    typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null
  )
  private readonly _user = signal<any>(
    typeof localStorage !== 'undefined' ? JSON.parse(localStorage.getItem('auth_user') || 'null') : null
  )

  readonly token = this._token.asReadonly()
  readonly user = this._user.asReadonly()
  readonly isAuthenticated = computed(() => this._token() !== null)
  readonly userRole = computed(() => this._user()?.role ?? null)

  setSession(token: string, user: any): void {
    localStorage.setItem('auth_token', token)
    localStorage.setItem('auth_user', JSON.stringify(user))
    this._token.set(token)
    this._user.set(user)
  }

  clearSession(): void {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    this._token.set(null)
    this._user.set(null)
  }
}
