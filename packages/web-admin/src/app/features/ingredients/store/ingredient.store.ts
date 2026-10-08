import { Injectable, inject, signal } from '@angular/core'
import { firstValueFrom } from 'rxjs'
import { IngredientService } from '../services/ingredient.service'
import type { Ingredient, CreateIngredientDto, UpdateIngredientDto } from '../models/ingredient.model'

@Injectable({ providedIn: 'root' })
export class IngredientStore {
  private readonly service = inject(IngredientService)

  private readonly _ingredients = signal<Ingredient[]>([])
  private readonly _loading = signal(false)
  private readonly _error = signal<string | null>(null)
  private _currentRestaurantId: string | null = null

  readonly ingredients = this._ingredients.asReadonly()
  readonly loading = this._loading.asReadonly()
  readonly error = this._error.asReadonly()

  async loadByRestaurant(restaurantId: string): Promise<void> {
    this._currentRestaurantId = restaurantId
    this._loading.set(true)
    this._error.set(null)
    try {
      const data = await firstValueFrom(this.service.getAll(restaurantId))
      this._ingredients.set(data)
    } catch {
      this._error.set('No se pudieron cargar los ingredientes.')
    } finally {
      this._loading.set(false)
    }
  }

  async create(restaurantId: string, dto: CreateIngredientDto): Promise<void> {
    const ingredient = await firstValueFrom(this.service.create(restaurantId, dto))
    this._ingredients.update(list => [...list, ingredient])
  }

  async update(restaurantId: string, id: string, dto: UpdateIngredientDto): Promise<void> {
    const updated = await firstValueFrom(this.service.update(restaurantId, id, dto))
    this._ingredients.update(list => list.map(i => i.id === id ? updated : i))
  }

  async delete(restaurantId: string, id: string): Promise<void> {
    await firstValueFrom(this.service.delete(restaurantId, id))
    this._ingredients.update(list => list.filter(i => i.id !== id))
  }
}
