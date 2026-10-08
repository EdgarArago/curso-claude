import { Database } from '@config/database.js'
import type { Dish } from '@models/dish.model.js'
import { normalizeDishCategory } from '@models/dish.model.js'

interface DishRow {
    id: string
    name: string
    description: string | null
    price: number
    category: string
    available: number
    restaurantId: string
    createdAt: string
    updatedAt: string
}

interface DishIngredientRow {
    ingredientId: string
    quantity: number
}

export interface DishRepository {
    findById(id: string): Promise<Dish | null>
    findByRestaurantId(restaurantId: string): Promise<Dish[]>
    save(dish: Dish): Promise<void>
    delete(id: string): Promise<void>
}

export class SqliteDishRepository implements DishRepository {
    constructor(private db: Database) {}

    async findById(id: string): Promise<Dish | null> {
        const row = await this.db.get<DishRow>(
            'SELECT id, name, description, price, category, available, restaurant_id as restaurantId, created_at as createdAt, updated_at as updatedAt FROM dishes WHERE id = ?',
            [id]
        )
        if (!row) return null
        const ingredients = await this.findIngredientsByDishId(id)
        return this.mapToDish(row, ingredients)
    }

    async findByRestaurantId(restaurantId: string): Promise<Dish[]> {
        const rows = await this.db.all<DishRow>(
            'SELECT id, name, description, price, category, available, restaurant_id as restaurantId, created_at as createdAt, updated_at as updatedAt FROM dishes WHERE restaurant_id = ?',
            [restaurantId]
        )

        const dishes: Dish[] = []
        for (const row of rows) {
            const ingredients = await this.findIngredientsByDishId(row.id)
            dishes.push(this.mapToDish(row, ingredients))
        }
        return dishes
    }

    async save(dish: Dish): Promise<void> {
        const existing = await this.db.get<{ id: string }>('SELECT id FROM dishes WHERE id = ?', [dish.id])

        if (existing) {
            await this.db.run(
                'UPDATE dishes SET name = ?, description = ?, price = ?, category = ?, available = ?, updated_at = ? WHERE id = ?',
                [dish.name, dish.description, dish.price, dish.category, dish.available ? 1 : 0, dish.updatedAt, dish.id]
            )
        } else {
            await this.db.run(
                'INSERT INTO dishes (id, name, description, price, category, available, restaurant_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [dish.id, dish.name, dish.description, dish.price, dish.category, dish.available ? 1 : 0, dish.restaurantId, dish.createdAt, dish.updatedAt]
            )
        }

        await this.db.run('DELETE FROM dish_ingredients WHERE dish_id = ?', [dish.id])
        for (const ingredient of dish.ingredients) {
            await this.db.run(
                'INSERT INTO dish_ingredients (dish_id, ingredient_id, quantity) VALUES (?, ?, ?)',
                [dish.id, ingredient.ingredientId, ingredient.quantity]
            )
        }
    }

    async delete(id: string): Promise<void> {
        await this.db.run('DELETE FROM dish_ingredients WHERE dish_id = ?', [id])
        await this.db.run('DELETE FROM dishes WHERE id = ?', [id])
    }

    private async findIngredientsByDishId(dishId: string): Promise<DishIngredientRow[]> {
        return this.db.all<DishIngredientRow>(
            'SELECT ingredient_id as ingredientId, quantity FROM dish_ingredients WHERE dish_id = ?',
            [dishId]
        )
    }

    private mapToDish(row: DishRow, ingredients: DishIngredientRow[]): Dish {
        return {
            id: row.id,
            name: row.name,
            description: row.description,
            price: row.price,
            category: normalizeDishCategory(row.category),
            available: row.available === 1,
            restaurantId: row.restaurantId,
            ingredients: ingredients.map(i => ({ ingredientId: i.ingredientId, quantity: i.quantity })),
            createdAt: row.createdAt,
            updatedAt: row.updatedAt
        }
    }
}
