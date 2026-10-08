import { Injectable, inject } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { environment } from '../../../../environments/environment'
import type { Dish, CreateDishDto } from '../models/dish.model'

@Injectable({ providedIn: 'root' })
export class DishService {
  private readonly http = inject(HttpClient)

  private buildUrl(restaurantId: string): string {
    return `${environment.apiUrl}/restaurants/${restaurantId}/dishes`
  }

  getAll(restaurantId: string) {
    return this.http.get<Dish[]>(this.buildUrl(restaurantId))
  }

  getById(restaurantId: string, id: string) {
    return this.http.get<Dish>(`${this.buildUrl(restaurantId)}/${id}`)
  }

  create(restaurantId: string, dto: CreateDishDto) {
    return this.http.post<Dish>(this.buildUrl(restaurantId), dto)
  }

  update(restaurantId: string, id: string, dto: CreateDishDto) {
    return this.http.put<Dish>(`${this.buildUrl(restaurantId)}/${id}`, dto)
  }

  delete(restaurantId: string, id: string) {
    return this.http.delete<void>(`${this.buildUrl(restaurantId)}/${id}`)
  }
}
