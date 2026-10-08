import { SqliteEmployeeRepository } from '@employee/infrastructure/SqliteEmployeeRepository.js'
import { Database } from '@config/database.js'
import { Employee } from '@employee/domain/Employee.js'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'

describe('SqliteEmployeeRepository (Integration)', () => {
    let db: Database
    let repo: SqliteEmployeeRepository

    beforeAll(async () => {
        process.env.NODE_ENV = 'test'
        db = new Database()
        await db.initialize()
        repo = new SqliteEmployeeRepository(db)

        await db.run(
            'INSERT INTO restaurants (id, name, address, email, phone, owner_first_name, owner_last_name, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            ['r1', 'La Trattoria', 'Calle Mayor 10', 'info@trattoria.com', '+34 612345678', 'Carlos', 'García', new Date().toISOString(), new Date().toISOString()]
        )
    })

    afterAll(async () => {
        await db.close()
    })

    it('should save and find an employee by id', async () => {
        const employee = Employee.create({
            id: 'e1',
            firstName: 'Eve',
            lastName: 'Black',
            email: 'eve@resttek.com',
            passwordHash: 'hashed123',
            role: 'manager',
            restaurantId: null
        })

        await repo.save(employee)

        const found = await repo.findById('e1')
        expect(found).not.toBeNull()
        expect(found?.email).toBe('eve@resttek.com')
        expect(found?.role).toBe('manager')
    })

    it('should find an employee by email', async () => {
        const found = await repo.findByEmail('eve@resttek.com')
        expect(found).not.toBeNull()
        expect(found?.id).toBe('e1')
    })

    it('should update an existing employee', async () => {
        const updated = Employee.create({
            id: 'e1',
            firstName: 'Eve Jane',
            lastName: 'Black',
            email: 'eve@resttek.com',
            passwordHash: 'hashed123',
            role: 'manager',
            restaurantId: 'r1'
        })

        await repo.save(updated)

        const found = await repo.findById('e1')
        expect(found?.firstName).toBe('Eve Jane')
        expect(found?.restaurantId).toBe('r1')
    })

    it('should return null for non-existent employee', async () => {
        const found = await repo.findById('non-existent')
        expect(found).toBeNull()
    })

    it('should delete an employee', async () => {
        await repo.delete('e1')
        const found = await repo.findById('e1')
        expect(found).toBeNull()
    })
})
