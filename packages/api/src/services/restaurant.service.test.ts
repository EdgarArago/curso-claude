import { describe, it, expect, beforeEach } from 'vitest'
import { RestaurantService } from './restaurant.service.js'
import { MockRestaurantRepository } from '@repositories/mocks/MockRestaurantRepository.js'

describe('RestaurantService', () => {
    let repo: MockRestaurantRepository
    let service: RestaurantService

    const validDTO = {
        name: 'La Trattoria',
        address: 'Calle Mayor 10',
        email: 'info@trattoria.com',
        phone: '+34 612345678',
        ownerFirstName: 'Carlos',
        ownerLastName: 'García',
        logoUrl: null
    }

    beforeEach(() => {
        repo = new MockRestaurantRepository()
        service = new RestaurantService(repo)
    })

    describe('create', () => {
        it('should create and save a restaurant', async () => {
            const result = await service.create(validDTO)

            expect(result.id).toBeDefined()
            expect(result.name).toBe('La Trattoria')
            expect(result.email).toBe('info@trattoria.com')

            const saved = await repo.findById(result.id)
            expect(saved).not.toBeNull()
        })

        it('should create a restaurant without logo', async () => {
            const result = await service.create({ ...validDTO, logoUrl: null })
            expect(result.logoUrl).toBeNull()
        })

        it('should throw RestaurantNameRequiredError for empty name', async () => {
            await expect(service.create({ ...validDTO, name: '' }))
                .rejects.toThrow('Restaurant name is required')
        })

        it('should throw RestaurantAddressRequiredError for empty address', async () => {
            await expect(service.create({ ...validDTO, address: '' }))
                .rejects.toThrow('Restaurant address is required')
        })

        it('should throw InvalidEmailError for invalid email', async () => {
            await expect(service.create({ ...validDTO, email: 'bad' }))
                .rejects.toThrow('Invalid email format')
        })

        it('should throw InvalidPhoneError for invalid phone', async () => {
            await expect(service.create({ ...validDTO, phone: 'abc' }))
                .rejects.toThrow('Invalid phone format')
        })

        it('should throw InvalidPhoneError for empty phone', async () => {
            await expect(service.create({ ...validDTO, phone: '' }))
                .rejects.toThrow('Invalid phone format')
        })

        it('should accept a phone with country code', async () => {
            const result = await service.create({ ...validDTO, phone: '+34 612 345 678' })
            expect(result.phone).toBe('+34 612 345 678')
        })

        it('should accept a phone without country code', async () => {
            const result = await service.create({ ...validDTO, phone: '612345678' })
            expect(result.phone).toBe('612345678')
        })

        it('should throw OwnerFirstNameRequiredError for empty owner first name', async () => {
            await expect(service.create({ ...validDTO, ownerFirstName: '' }))
                .rejects.toThrow('Owner first name is required')
        })

        it('should throw OwnerLastNameRequiredError for empty owner last name', async () => {
            await expect(service.create({ ...validDTO, ownerLastName: '' }))
                .rejects.toThrow('Owner last name is required')
        })
    })

    describe('update', () => {
        it('should update an existing restaurant', async () => {
            const created = await service.create(validDTO)
            const result = await service.update(created.id, {
                ...validDTO,
                name: 'La Trattoria Renovada'
            })

            expect(result.name).toBe('La Trattoria Renovada')
        })

        it('should throw RestaurantNotFoundError for non-existent id', async () => {
            await expect(service.update('non-existent', validDTO))
                .rejects.toThrow('Restaurant not found')
        })
    })

    describe('getById / getAll', () => {
        it('should get a restaurant by id', async () => {
            const created = await service.create(validDTO)
            const result = await service.getById(created.id)

            expect(result.name).toBe('La Trattoria')
        })

        it('should throw RestaurantNotFoundError for non-existent id', async () => {
            await expect(service.getById('non-existent'))
                .rejects.toThrow('Restaurant not found')
        })

        it('should get all restaurants', async () => {
            await service.create(validDTO)
            await service.create({ ...validDTO, name: 'Otro', email: 'otro@test.com' })

            const results = await service.getAll()
            expect(results).toHaveLength(2)
        })
    })
})
