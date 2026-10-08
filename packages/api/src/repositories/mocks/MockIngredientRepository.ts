import type { IngredientRepository } from '@repositories/ingredient.repository.js'
import type { Ingredient } from '@models/ingredient.model.js'

export class MockIngredientRepository implements IngredientRepository {
    private ingredients: Map<string, Ingredient> = new Map()

    async findById(id: string): Promise<Ingredient | null> {
        return this.ingredients.get(id) || null
    }

    async findByRestaurantId(restaurantId: string): Promise<Ingredient[]> {
        return Array.from(this.ingredients.values())
            .filter(i => i.restaurantId === restaurantId)
    }

    async save(ingredient: Ingredient): Promise<void> {
        this.ingredients.set(ingredient.id, ingredient)
    }

    async delete(id: string): Promise<void> {
        this.ingredients.delete(id)
    }
}
