import { Component, inject, OnInit, signal } from '@angular/core'
import { RouterLink } from '@angular/router'
import { LucideAngularModule } from 'lucide-angular'
import { RestaurantService } from '../../core/services/restaurant.service'
import { Restaurant } from '../../core/models/restaurant.model'

@Component({
  selector: 'app-restaurant-list',
  standalone: true,
  imports: [RouterLink, LucideAngularModule],
  template: `
    <div class="container">
      <div class="page-header">
        <h1>Restaurantes</h1>
        <p>Selecciona un restaurante para ver su carta</p>
      </div>

      @if (loading()) {
        <div class="spinner"></div>
      } @else if (error()) {
        <div class="alert-error">{{ error() }}</div>
      } @else if (restaurants().length === 0) {
        <div class="empty-state">
          <p>No hay restaurantes disponibles</p>
        </div>
      } @else {
        <div class="restaurant-grid">
          @for (restaurant of restaurants(); track restaurant.id) {
            <a [routerLink]="['/restaurants', restaurant.id]" class="restaurant-card card">
              <div class="restaurant-logo">
                @if (restaurant.logoUrl) {
                  <img [src]="restaurant.logoUrl" [alt]="restaurant.name" />
                } @else {
                  <lucide-icon name="utensils" [size]="32"></lucide-icon>
                }
              </div>
              <div class="restaurant-info">
                <h3>{{ restaurant.name }}</h3>
                <p class="address">{{ restaurant.address }}</p>
                <p class="phone">{{ restaurant.phone }}</p>
              </div>
            </a>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    .restaurant-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }
    .restaurant-card {
      display: flex;
      gap: 16px;
      padding: 20px;
      transition: all var(--transition);
    }
    .restaurant-card:hover {
      transform: translateY(-2px);
      border-color: var(--green-medium);
    }
    .restaurant-logo {
      width: 64px;
      height: 64px;
      border-radius: var(--radius-sm);
      background: var(--bg-hover);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--green-light);
      overflow: hidden;
    }
    .restaurant-logo img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .restaurant-info h3 {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 4px;
    }
    .restaurant-info .address {
      color: var(--text-muted);
      font-size: 13px;
    }
    .restaurant-info .phone {
      color: var(--text-secondary);
      font-size: 13px;
      margin-top: 4px;
    }
  `]
})
export class RestaurantListComponent implements OnInit {
  private readonly restaurantService = inject(RestaurantService)
  
  readonly restaurants = signal<Restaurant[]>([])
  readonly loading = signal(true)
  readonly error = signal<string | null>(null)

  ngOnInit(): void {
    this.loadRestaurants()
  }

  private loadRestaurants(): void {
    this.restaurantService.getAll().subscribe({
      next: (data) => {
        this.restaurants.set(data)
        this.loading.set(false)
      },
      error: (err) => {
        this.error.set('Error al cargar los restaurantes')
        this.loading.set(false)
      }
    })
  }
}
