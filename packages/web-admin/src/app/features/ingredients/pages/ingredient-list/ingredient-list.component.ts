import { Component, inject, OnInit, signal } from '@angular/core'
import { ActivatedRoute, RouterLink } from '@angular/router'
import { FormsModule } from '@angular/forms'
import { LucideAngularModule } from 'lucide-angular'
import { IngredientStore } from '../../store/ingredient.store'

@Component({
  selector: 'app-ingredient-list',
  standalone: true,
  imports: [RouterLink, FormsModule, LucideAngularModule],
  templateUrl: './ingredient-list.component.html',
  styleUrl: './ingredient-list.component.css'
})
export class IngredientListComponent implements OnInit {
  readonly store = inject(IngredientStore)
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
    if (confirm('¿Estás seguro de eliminar este ingrediente?')) {
      try {
        await this.store.delete(this.restaurantId, id)
      } catch {
        alert('Error al eliminar el ingrediente.')
      }
    }
  }
}
