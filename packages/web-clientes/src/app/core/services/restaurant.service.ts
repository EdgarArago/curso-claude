import { Injectable, inject } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { API_URL } from '@resttek/web-shared'
import { Restaurant } from '../models/restaurant.model'

@Injectable({ providedIn: 'root' })
export class RestaurantService {
  private readonly http = inject(HttpClient)
  private readonly apiUrl = inject(API_URL)

  getAll(): Observable<Restaurant[]> {
    return this.http.get<Restaurant[]>(`${this.apiUrl}/public/restaurants`)
  }

  getById(id: string): Observable<Restaurant> {
    return this.http.get<Restaurant>(`${this.apiUrl}/public/restaurants/${id}`)
  }
}
