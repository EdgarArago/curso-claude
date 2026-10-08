import { Injectable, inject } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { API_URL } from '@resttek/web-shared'
import { Dish } from '../models/dish.model'

@Injectable({ providedIn: 'root' })
export class DishService {
  private readonly http = inject(HttpClient)
  private readonly apiUrl = inject(API_URL)

  getByRestaurant(restaurantId: string): Observable<Dish[]> {
    return this.http.get<Dish[]>(`${this.apiUrl}/public/restaurants/${restaurantId}/dishes`)
  }
}
