import { SqliteRestaurantRepository } from './restaurant.repository.js'
import { Database } from '@config/database.js'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'

describe('SqliteRestaurantRepository (Integration)', () => {
    let db: Database
    let repo: SqliteRestaurantRepository

    beforeAll(async () => {
        process.env.NODE_ENV = 'test'
        db = new Database()
        await db.initialize()
        repo = new SqliteRestaurantRepository(db)
    })

    afterAll(async () => {
        await db.close()
    })

    it('should save and find a restaurant by id', async () => {
        const restaurant = {
            id: 'r1',
            name: 'La Trattoria',
            address: 'Calle Mayor 10',
            email: 'info@trattoria.com',
            phone: '+34 612345678',
            ownerFirstName: 'Carlos',
            ownerLastName: 'García',
            logoUrl: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }

        await repo.save(restaurant)

        const found = await repo.findById('r1')
        expect(found).not.toBeNull()
        expect(found?.name).toBe('La Trattoria')
        expect(found?.email).toBe('info@trattoria.com')
    })

    it('should update an existing restaurant', async () => {
        const updated = {
            id: 'r1',
            name: 'La Trattoria Renovada',
            address: 'Calle Mayor 10',
            email: 'info@trattoria.com',
            phone: '+34 612345678',
            ownerFirstName: 'Carlos',
            ownerLastName: 'García',
            logoUrl: 'https://example.com/logo.png',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }

        await repo.save(updated)

        const found = await repo.findById('r1')
        expect(found?.name).toBe('La Trattoria Renovada')
        expect(found?.logoUrl).toBe('https://example.com/logo.png')
    })

    it('should return null for non-existent restaurant', async () => {
        const found = await repo.findById('non-existent')
        expect(found).toBeNull()
    })

    it('should find all restaurants', async () => {
        const results = await repo.findAll()
        expect(results.length).toBeGreaterThanOrEqual(1)
    })
})
