import { Injectable, inject } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { environment } from '../../../../environments/environment'
import type { Restaurant, CreateRestaurantDto } from '../models/restaurant.model'

@Injectable({ providedIn: 'root' })
export class RestaurantService {
  private readonly http = inject(HttpClient)
  private readonly baseUrl = `${environment.apiUrl}/restaurants`

  getAll() {
    return this.http.get<Restaurant[]>(this.baseUrl)
  }

  getById(id: string) {
    return this.http.get<Restaurant>(`${this.baseUrl}/${id}`)
  }

  create(dto: CreateRestaurantDto) {
    return this.http.post<Restaurant>(this.baseUrl, dto)
  }

  update(id: string, dto: CreateRestaurantDto) {
    return this.http.put<Restaurant>(`${this.baseUrl}/${id}`, dto)
  }
}
