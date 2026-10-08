import { Component, inject, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { Router } from '@angular/router'
import { LucideAngularModule } from 'lucide-angular'
import { AuthService } from '../../auth/auth.service'

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, LucideAngularModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  private readonly authService = inject(AuthService)
  private readonly router = inject(Router)

  firstName = ''
  lastName = ''
  email = ''
  password = ''
  confirmPassword = ''
  error = signal<string | null>(null)
  loading = signal(false)

  async onSubmit(): Promise<void> {
    this.error.set(null)

    if (this.password !== this.confirmPassword) {
      this.error.set('Las contraseñas no coinciden')
      return
    }

    if (this.password.length < 6) {
      this.error.set('La contraseña debe tener al menos 6 caracteres')
      return
    }

    this.loading.set(true)
    try {
      await this.authService.register(this.firstName, this.lastName, this.email, this.password)
      this.router.navigate(['/'])
    } catch {
      this.error.set('Error al registrar. Inténtalo de nuevo.')
    } finally {
      this.loading.set(false)
    }
  }
}
