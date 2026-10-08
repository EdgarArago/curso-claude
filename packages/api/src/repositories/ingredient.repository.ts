import { Database } from '@config/database.js'
import type { Ingredient } from '@models/ingredient.model.js'
import { normalizeIngredientUnit } from '@models/ingredient.model.js'

interface IngredientRow {
    id: string
    name: string
    unit: string
    currentStock: number
    restaurantId: string
    createdAt: string
    updatedAt: string
}

export interface IngredientRepository {
    findById(id: string): Promise<Ingredient | null>
    findByRestaurantId(restaurantId: string): Promise<Ingredient[]>
    save(ingredient: Ingredient): Promise<void>
    delete(id: string): Promise<void>
}

export class SqliteIngredientRepository implements IngredientRepository {
    constructor(private db: Database) {}

    async findById(id: string): Promise<Ingredient | null> {
        const row = await this.db.get<IngredientRow>(
            'SELECT id, name, unit, current_stock as currentStock, restaurant_id as restaurantId, created_at as createdAt, updated_at as updatedAt FROM ingredients WHERE id = ?',
            [id]
        )
        if (!row) return null
        return this.mapToIngredient(row)
    }

    async findByRestaurantId(restaurantId: string): Promise<Ingredient[]> {
        const rows = await this.db.all<IngredientRow>(
            'SELECT id, name, unit, current_stock as currentStock, restaurant_id as restaurantId, created_at as createdAt, updated_at as updatedAt FROM ingredients WHERE restaurant_id = ?',
            [restaurantId]
        )
        return rows.map(row => this.mapToIngredient(row))
    }

    async save(ingredient: Ingredient): Promise<void> {
        const existing = await this.findById(ingredient.id)
        if (existing) {
            await this.db.run(
                'UPDATE ingredients SET name = ?, unit = ?, current_stock = ?, updated_at = ? WHERE id = ?',
                [ingredient.name, ingredient.unit, ingredient.currentStock, ingredient.updatedAt, ingredient.id]
            )
        } else {
            await this.db.run(
                'INSERT INTO ingredients (id, name, unit, current_stock, restaurant_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [ingredient.id, ingredient.name, ingredient.unit, ingredient.currentStock, ingredient.restaurantId, ingredient.createdAt, ingredient.updatedAt]
            )
        }
    }

    async delete(id: string): Promise<void> {
        await this.db.run('DELETE FROM ingredients WHERE id = ?', [id])
    }

    private mapToIngredient(row: IngredientRow): Ingredient {
        return {
            id: row.id,
            name: row.name,
            unit: normalizeIngredientUnit(row.unit),
            currentStock: row.currentStock,
            restaurantId: row.restaurantId,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt
        }
    }
}
