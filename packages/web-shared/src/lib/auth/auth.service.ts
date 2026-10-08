import { Injectable, inject } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Router } from '@angular/router'
import { firstValueFrom } from 'rxjs'
import { API_URL } from '../tokens'
import { AuthStore } from './auth.store'

interface LoginResponse {
  token: string
  employee: {
    id: string
    firstName: string
    lastName: string
    email: string
    role: string
    restaurantId: string | null
  }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient)
  private readonly store = inject(AuthStore)
  private readonly router = inject(Router)

  private readonly apiUrl = inject(API_URL)

  async login(email: string, password: string): Promise<void> {
    const response = await firstValueFrom(
      this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, { email, password })
    )
    this.store.setSession(response.token, response.employee)
  }

  async register(firstName: string, lastName: string, email: string, password: string): Promise<void> {
    const response = await firstValueFrom(
      this.http.post<LoginResponse>(`${this.apiUrl}/auth/register`, {
        firstName,
        lastName,
        email,
        password
      })
    )
    this.store.setSession(response.token, response.employee)
  }

  logout(): void {
    this.store.clearSession()
    this.router.navigate(['/login'])
  }
}
