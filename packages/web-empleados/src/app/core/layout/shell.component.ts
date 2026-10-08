import { Component, inject, computed } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService, AuthStore } from '@resttek/web-shared';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.css'
})
export class ShellComponent {
  readonly authService = inject(AuthService)
  readonly authStore = inject(AuthStore)
  private readonly router = inject(Router)

  readonly userRole = computed(() => this.authStore.userRole())
  readonly userRestaurantId = computed(() => this.authStore.user()?.restaurantId)
  readonly hasRestaurant = computed(() => !!this.authStore.user()?.restaurantId)

  readonly canSeeCocina = computed(() => 
    this.userRole() === 'cocinero' || this.userRole() === 'manager'
  )

  readonly canSeeBarra = computed(() => 
    this.userRole() === 'camarero' || this.userRole() === 'manager'
  )

  readonly canSeeSalon = computed(() => 
    this.userRole() === 'camarero' || this.userRole() === 'manager'
  )

  readonly defaultRoute = computed(() => {
    const role = this.userRole()
    if (role === 'cocinero') return '/cocina'
    if (role === 'manager') return '/cocina'
    if (role === 'camarero') return '/barra'
    return '/login'
  })

  logout(): void {
    this.authService.logout()
  }
}
