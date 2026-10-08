import { Component, inject, OnInit, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { ActivatedRoute, Router, RouterLink } from '@angular/router'
import { LucideAngularModule } from 'lucide-angular'
import { firstValueFrom } from 'rxjs'
import { IngredientStore } from '../../store/ingredient.store'
import { IngredientService } from '../../services/ingredient.service'
import type { CreateIngredientDto, IngredientUnit } from '../../models/ingredient.model'

@Component({
  selector: 'app-ingredient-form',
  standalone: true,
  imports: [FormsModule, RouterLink, LucideAngularModule],
  templateUrl: './ingredient-form.component.html',
  styleUrl: './ingredient-form.component.css'
})
export class IngredientFormComponent implements OnInit {
  private readonly store = inject(IngredientStore)
  private readonly service = inject(IngredientService)
  private readonly route = inject(ActivatedRoute)
  private readonly router = inject(Router)

  isEditing = false
  ingredientId: string | null = null
  restaurantId: string = ''
  loading = signal(false)
  error = signal<string | null>(null)

  units: IngredientUnit[] = ['kg', 'g', 'l', 'ml', 'unidad']

  form: CreateIngredientDto = {
    name: '',
    unit: 'kg',
    currentStock: 0
  }

  get pageTitle(): string {
    return this.isEditing ? 'Editar ingrediente' : 'Nuevo ingrediente'
  }

  get listUrl(): string {
    return `/restaurants/${this.restaurantId}/ingredients`
  }

  ngOnInit(): void {
    this.restaurantId = this.route.parent?.snapshot.params['restaurantId'] ?? ''
    const id = this.route.snapshot.paramMap.get('id')

    if (id && this.restaurantId) {
      this.isEditing = true
      this.ingredientId = id
      this.loadIngredient()
    }
  }

  private async loadIngredient(): Promise<void> {
    this.loading.set(true)
    try {
      const ingredients = await firstValueFrom(this.service.getAll(this.restaurantId))
      const found = ingredients.find(i => i.id === this.ingredientId)
      if (found) {
        this.form = {
          name: found.name,
          unit: found.unit,
          currentStock: found.currentStock
        }
      }
    } catch {
      this.error.set('No se pudo cargar el ingrediente.')
    } finally {
      this.loading.set(false)
    }
  }

  async onSubmit(): Promise<void> {
    this.error.set(null)
    this.loading.set(true)
    try {
      if (this.isEditing && this.ingredientId) {
        await this.store.update(this.restaurantId, this.ingredientId, this.form)
      } else {
        await this.store.create(this.restaurantId, this.form)
      }
      this.router.navigate(['/restaurants', this.restaurantId, 'ingredients'])
    } catch (err: any) {
      this.error.set(err?.error?.message ?? 'Error al guardar el ingrediente.')
    } finally {
      this.loading.set(false)
    }
  }
}
