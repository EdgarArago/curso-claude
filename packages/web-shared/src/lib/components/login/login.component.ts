import { Component, inject, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { Router } from '@angular/router'
import { LucideAngularModule } from 'lucide-angular'
import { AuthService } from '../../auth/auth.service'

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, LucideAngularModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private readonly authService = inject(AuthService)
  private readonly router = inject(Router)

  email = ''
  password = ''
  error = signal<string | null>(null)
  loading = signal(false)

  async onSubmit(): Promise<void> {
    this.error.set(null)
    this.loading.set(true)
    try {
      await this.authService.login(this.email, this.password)
      this.router.navigate(['/'])
    } catch {
      this.error.set('Credenciales inválidas. Inténtalo de nuevo.')
    } finally {
      this.loading.set(false)
    }
  }
}
