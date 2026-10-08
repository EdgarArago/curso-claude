import { Component, inject, OnInit, signal } from '@angular/core'
import { ActivatedRoute, RouterLink } from '@angular/router'
import { LucideAngularModule } from 'lucide-angular'
import { RestaurantStore } from '../../store/restaurant.store'

@Component({
  selector: 'app-restaurant-dashboard',
  standalone: true,
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './restaurant-dashboard.component.html',
  styleUrl: './restaurant-dashboard.component.css'
})
export class RestaurantDashboardComponent implements OnInit {
  private readonly route = inject(ActivatedRoute)
  private readonly restaurantStore = inject(RestaurantStore)

  restaurantId = ''
  restaurantName = signal('')

  ngOnInit(): void {
    this.restaurantId = this.route.parent?.snapshot.params['restaurantId'] ?? ''
    const restaurant = this.restaurantStore.getById(this.restaurantId)
    this.restaurantName.set(restaurant?.name ?? 'Restaurante')
  }
}
