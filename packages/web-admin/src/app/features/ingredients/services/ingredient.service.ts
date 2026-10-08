import { Injectable, inject } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { environment } from '../../../../environments/environment'
import type { Ingredient, CreateIngredientDto, UpdateIngredientDto } from '../models/ingredient.model'

@Injectable({ providedIn: 'root' })
export class IngredientService {
  private readonly http = inject(HttpClient)

  private buildUrl(restaurantId: string): string {
    return `${environment.apiUrl}/restaurants/${restaurantId}/ingredients`
  }

  getAll(restaurantId: string) {
    return this.http.get<Ingredient[]>(this.buildUrl(restaurantId))
  }

  create(restaurantId: string, dto: CreateIngredientDto) {
    return this.http.post<Ingredient>(this.buildUrl(restaurantId), dto)
  }

  update(restaurantId: string, id: string, dto: UpdateIngredientDto) {
    return this.http.put<Ingredient>(`${this.buildUrl(restaurantId)}/${id}`, dto)
  }

  delete(restaurantId: string, id: string) {
    return this.http.delete<void>(`${this.buildUrl(restaurantId)}/${id}`)
  }
}
