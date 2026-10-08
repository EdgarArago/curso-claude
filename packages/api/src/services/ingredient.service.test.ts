import { describe, it, expect, beforeEach } from 'vitest'
import { IngredientService } from './ingredient.service.js'
import { normalizeIngredientUnit } from '@models/ingredient.model.js'
import { MockIngredientRepository } from '@repositories/mocks/MockIngredientRepository.js'

describe('normalizeIngredientUnit', () => {
    it('should accept a valid unit', () => {
        expect(normalizeIngredientUnit('kg')).toBe('kg')
    })

    it('should normalize to lowercase', () => {
        expect(normalizeIngredientUnit('ML')).toBe('ml')
    })

    it('should throw InvalidUnitError for invalid unit', () => {
        expect(() => normalizeIngredientUnit('invalid')).toThrow('Invalid unit')
    })

    it('should throw InvalidUnitError for empty unit', () => {
        expect(() => normalizeIngredientUnit('')).toThrow('Unit must be provided')
    })

    it('should accept all valid units', () => {
        const validUnits = ['kg', 'g', 'l', 'ml', 'unidad']
        for (const u of validUnits) {
            expect(normalizeIngredientUnit(u)).toBe(u)
        }
    })
})

describe('IngredientService', () => {
    let repo: MockIngredientRepository
    let service: IngredientService

    const validInput = {
        name: 'Tomate',
        unit: 'kg',
        currentStock: 10,
        restaurantId: 'r1'
    }

    beforeEach(() => {
        repo = new MockIngredientRepository()
        service = new IngredientService(repo)
    })

    describe('create', () => {
        it('should create and save an ingredient', async () => {
            const result = await service.create(validInput)

            expect(result.id).toBeDefined()
            expect(result.name).toBe('Tomate')
            expect(result.unit).toBe('kg')
            expect(result.currentStock).toBe(10)
        })

        it('should throw IngredientNameRequiredError for empty name', async () => {
            await expect(service.create({ ...validInput, name: '' }))
                .rejects.toThrow('Ingredient name is required')
        })

        it('should throw NegativeStockError for negative stock', async () => {
            await expect(service.create({ ...validInput, currentStock: -1 }))
                .rejects.toThrow('Stock cannot be negative')
        })

        it('should throw InvalidUnitError for invalid unit', async () => {
            await expect(service.create({ ...validInput, unit: 'invalid' }))
                .rejects.toThrow('Invalid unit')
        })

        it('should throw RestaurantIdRequiredError for empty restaurantId', async () => {
            await expect(service.create({ ...validInput, restaurantId: '' }))
                .rejects.toThrow('Restaurant ID is required')
        })

        it('should allow zero stock', async () => {
            const result = await service.create({ ...validInput, currentStock: 0 })
            expect(result.currentStock).toBe(0)
        })
    })

    describe('update', () => {
        it('should update an existing ingredient', async () => {
            const created = await service.create(validInput)

            const updated = await service.update(created.id, {
                name: 'Tomate Cherry',
                unit: 'kg',
                currentStock: 15
            })

            expect(updated.name).toBe('Tomate Cherry')
            expect(updated.currentStock).toBe(15)
        })

        it('should throw IngredientNotFoundError for non-existent id', async () => {
            await expect(service.update('non-existent', {
                name: 'X',
                unit: 'kg',
                currentStock: 0
            })).rejects.toThrow('Ingredient not found')
        })
    })

    describe('delete', () => {
        it('should delete an existing ingredient', async () => {
            const created = await service.create(validInput)

            await service.delete(created.id)

            const found = await repo.findById(created.id)
            expect(found).toBeNull()
        })

        it('should throw IngredientNotFoundError for non-existent id', async () => {
            await expect(service.delete('non-existent'))
                .rejects.toThrow('Ingredient not found')
        })
    })
})
