import { Component, inject, OnInit, signal, computed } from '@angular/core'
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router'
import { LucideAngularModule } from 'lucide-angular'
import { AuthService, AuthStore } from '@resttek/web-shared'
import { RestaurantStore } from '../../features/restaurants/store/restaurant.store'
import { filter } from 'rxjs'

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.css'
})
export class ShellComponent implements OnInit {
  readonly authService = inject(AuthService)
  readonly authStore = inject(AuthStore)
  readonly restaurantStore = inject(RestaurantStore)
  private readonly router = inject(Router)

  expandedRestaurantId = signal<string | null>(null)

  readonly isAdmin = computed(() => this.authStore.userRole() === 'admin')

  ngOnInit(): void {
    this.restaurantStore.loadAll()
    this.syncExpandedFromUrl(this.router.url)

    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(e => this.syncExpandedFromUrl(e.urlAfterRedirects))

    if (!this.isAdmin()) {
      const userRestaurantId = this.authStore.user()?.restaurantId
      if (userRestaurantId) {
        this.expandedRestaurantId.set(userRestaurantId)
        if (this.router.url === '/dashboard' || this.router.url === '/') {
          this.router.navigate(['/restaurants', userRestaurantId, 'dashboard'])
        }
      }
    }
  }

  toggleRestaurant(id: string): void {
    this.expandedRestaurantId.update(current => current === id ? null : id)
  }

  private syncExpandedFromUrl(url: string): void {
    const match = url.match(/\/restaurants\/([^/]+)\//)
    if (match) {
      this.expandedRestaurantId.set(match[1])
    }
  }
}
