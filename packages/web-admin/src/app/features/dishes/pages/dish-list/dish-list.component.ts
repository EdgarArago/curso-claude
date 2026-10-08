import { Component, inject, OnInit, signal } from '@angular/core'
import { ActivatedRoute, RouterLink } from '@angular/router'
import { FormsModule } from '@angular/forms'
import { LucideAngularModule } from 'lucide-angular'
import { DishStore } from '../../store/dish.store'

@Component({
  selector: 'app-dish-list',
  standalone: true,
  imports: [RouterLink, FormsModule, LucideAngularModule],
  templateUrl: './dish-list.component.html',
  styleUrl: './dish-list.component.css'
})
export class DishListComponent implements OnInit {
  readonly store = inject(DishStore)
  private readonly route = inject(ActivatedRoute)
  restaurantId = ''

  ngOnInit(): void {
    this.restaurantId = this.route.parent?.snapshot.params['restaurantId'] ?? ''
    if (this.restaurantId) {
      this.store.loadByRestaurant(this.restaurantId)
    }
  }

  async onDelete(id: string): Promise<void> {
    if (!this.restaurantId) return
    if (confirm('¿Estás seguro de eliminar este plato?')) {
      try {
        await this.store.delete(this.restaurantId, id)
      } catch {
        alert('Error al eliminar el plato.')
      }
    }
  }

  async onToggleAvailable(id: string, dish: any): Promise<void> {
    if (!this.restaurantId) return
    try {
      await this.store.update(this.restaurantId, id, {
        ...dish,
        available: !dish.available
      })
    } catch {
      alert('Error al actualizar disponibilidad.')
    }
  }

  formatPrice(price: number): string {
    return price.toFixed(2) + ' €'
  }

  getCategoryLabel(category: string): string {
    const labels: Record<string, string> = {
      'entrante': 'Entrante',
      'principal': 'Principal',
      'postre': 'Postre',
      'bebida': 'Bebida'
    }
    return labels[category] ?? category
  }
}
