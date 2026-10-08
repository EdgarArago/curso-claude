import { Injectable, inject, signal, computed } from '@angular/core'
import { firstValueFrom } from 'rxjs'
import { RestaurantService } from '../services/restaurant.service'
import type { Restaurant, CreateRestaurantDto } from '../models/restaurant.model'

@Injectable({ providedIn: 'root' })
export class RestaurantStore {
  private readonly service = inject(RestaurantService)

  private readonly _restaurants = signal<Restaurant[]>([])
  private readonly _loading = signal(false)
  private readonly _error = signal<string | null>(null)

  readonly restaurants = this._restaurants.asReadonly()
  readonly loading = this._loading.asReadonly()
  readonly error = this._error.asReadonly()
  readonly totalCount = computed(() => this._restaurants().length)

  async loadAll(): Promise<void> {
    this._loading.set(true)
    this._error.set(null)
    try {
      const data = await firstValueFrom(this.service.getAll())
      this._restaurants.set(data)
    } catch {
      this._error.set('No se pudieron cargar los restaurantes.')
    } finally {
      this._loading.set(false)
    }
  }

  async create(dto: CreateRestaurantDto): Promise<void> {
    const restaurant = await firstValueFrom(this.service.create(dto))
    this._restaurants.update(list => [...list, restaurant])
  }

  async update(id: string, dto: CreateRestaurantDto): Promise<void> {
    const updated = await firstValueFrom(this.service.update(id, dto))
    this._restaurants.update(list => list.map(r => r.id === id ? updated : r))
  }

  async loadOne(id: string): Promise<void> {
    this._loading.set(true)
    this._error.set(null)
    try {
      const restaurant = await firstValueFrom(this.service.getById(id))
      this._restaurants.update(list => {
        const exists = list.find(r => r.id === id)
        return exists ? list.map(r => r.id === id ? restaurant : r) : [...list, restaurant]
      })
    } catch {
      this._error.set('No se pudo cargar el restaurante.')
    } finally {
      this._loading.set(false)
    }
  }

  getById(id: string): Restaurant | undefined {
    return this._restaurants().find(r => r.id === id)
  }
}
