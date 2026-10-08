import { SqliteIngredientRepository } from './ingredient.repository.js'
import { Database } from '@config/database.js'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'

describe('SqliteIngredientRepository (Integration)', () => {
    let db: Database
    let repo: SqliteIngredientRepository

    beforeAll(async () => {
        process.env.NODE_ENV = 'test'
        db = new Database()
        await db.initialize()
        repo = new SqliteIngredientRepository(db)

        await db.run(
            'INSERT INTO restaurants (id, name, address, email, phone, owner_first_name, owner_last_name, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            ['r1', 'La Trattoria', 'Calle Mayor 10', 'info@trattoria.com', '+34 612345678', 'Carlos', 'García', new Date().toISOString(), new Date().toISOString()]
        )
    })

    afterAll(async () => {
        await db.close()
    })

    it('should save and find an ingredient by id', async () => {
        const ingredient = {
            id: 'i1',
            name: 'Tomate',
            unit: 'kg' as const,
            currentStock: 10,
            restaurantId: 'r1',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }

        await repo.save(ingredient)

        const found = await repo.findById('i1')
        expect(found).not.toBeNull()
        expect(found?.name).toBe('Tomate')
        expect(found?.currentStock).toBe(10)
    })

    it('should find ingredients by restaurant id', async () => {
        const results = await repo.findByRestaurantId('r1')
        expect(results.length).toBeGreaterThanOrEqual(1)
    })

    it('should update an existing ingredient', async () => {
        const updated = {
            id: 'i1',
            name: 'Tomate Cherry',
            unit: 'kg' as const,
            currentStock: 15,
            restaurantId: 'r1',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }

        await repo.save(updated)

        const found = await repo.findById('i1')
        expect(found?.name).toBe('Tomate Cherry')
        expect(found?.currentStock).toBe(15)
    })

    it('should delete an ingredient', async () => {
        await repo.delete('i1')
        const found = await repo.findById('i1')
        expect(found).toBeNull()
    })
})
