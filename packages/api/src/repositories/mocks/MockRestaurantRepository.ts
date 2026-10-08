import type { RestaurantRepository } from '@repositories/restaurant.repository.js'
import type { Restaurant } from '@models/restaurant.model.js'

export class MockRestaurantRepository implements RestaurantRepository {
    private restaurants: Map<string, Restaurant> = new Map()

    async findById(id: string): Promise<Restaurant | null> {
        return this.restaurants.get(id) || null
    }

    async findAll(): Promise<Restaurant[]> {
        return Array.from(this.restaurants.values())
    }

    async save(restaurant: Restaurant): Promise<void> {
        this.restaurants.set(restaurant.id, restaurant)
    }
}
