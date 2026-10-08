import { Component, inject, OnInit } from '@angular/core'
import { RouterLink } from '@angular/router'
import { LucideAngularModule } from 'lucide-angular'
import { RestaurantStore } from '../../store/restaurant.store'

@Component({
  selector: 'app-restaurant-list',
  standalone: true,
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './restaurant-list.component.html',
  styleUrl: './restaurant-list.component.css'
})
export class RestaurantListComponent implements OnInit {
  readonly store = inject(RestaurantStore)

  ngOnInit(): void {
    this.store.loadAll()
  }
}
