import { Database } from '@config/database.js'
import type { Restaurant } from '@models/restaurant.model.js'

interface RestaurantRow {
    id: string
    name: string
    address: string
    email: string
    phone: string
    ownerFirstName: string
    ownerLastName: string
    logoUrl: string | null
    createdAt: string
    updatedAt: string
}

export interface RestaurantRepository {
    findById(id: string): Promise<Restaurant | null>
    findAll(): Promise<Restaurant[]>
    save(restaurant: Restaurant): Promise<void>
}

export class SqliteRestaurantRepository implements RestaurantRepository {
    constructor(private db: Database) {}

    async findById(id: string): Promise<Restaurant | null> {
        const row = await this.db.get<RestaurantRow>(
            'SELECT id, name, address, email, phone, owner_first_name as ownerFirstName, owner_last_name as ownerLastName, logo_url as logoUrl, created_at as createdAt, updated_at as updatedAt FROM restaurants WHERE id = ?',
            [id]
        )
        if (!row) return null
        return this.mapToRestaurant(row)
    }

    async findAll(): Promise<Restaurant[]> {
        const rows = await this.db.all<RestaurantRow>(
            'SELECT id, name, address, email, phone, owner_first_name as ownerFirstName, owner_last_name as ownerLastName, logo_url as logoUrl, created_at as createdAt, updated_at as updatedAt FROM restaurants'
        )
        return rows.map(row => this.mapToRestaurant(row))
    }

    async save(restaurant: Restaurant): Promise<void> {
        const existing = await this.findById(restaurant.id)
        if (existing) {
            await this.db.run(
                'UPDATE restaurants SET name = ?, address = ?, email = ?, phone = ?, owner_first_name = ?, owner_last_name = ?, logo_url = ?, updated_at = ? WHERE id = ?',
                [restaurant.name, restaurant.address, restaurant.email, restaurant.phone, restaurant.ownerFirstName, restaurant.ownerLastName, restaurant.logoUrl, restaurant.updatedAt, restaurant.id]
            )
        } else {
            await this.db.run(
                'INSERT INTO restaurants (id, name, address, email, phone, owner_first_name, owner_last_name, logo_url, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [restaurant.id, restaurant.name, restaurant.address, restaurant.email, restaurant.phone, restaurant.ownerFirstName, restaurant.ownerLastName, restaurant.logoUrl, restaurant.createdAt, restaurant.updatedAt]
            )
        }
    }

    private mapToRestaurant(row: RestaurantRow): Restaurant {
        return {
            id: row.id,
            name: row.name,
            address: row.address,
            email: row.email,
            phone: row.phone,
            ownerFirstName: row.ownerFirstName,
            ownerLastName: row.ownerLastName,
            logoUrl: row.logoUrl ?? null,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt
        }
    }
}
