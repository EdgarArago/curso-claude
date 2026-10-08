import { Employee } from '@employee/domain/Employee.js'
import { describe, it, expect } from 'vitest'

describe('Employee Entity (Domain)', () => {
    it('should create a valid employee', () => {
        const employee = Employee.create({
            id: '123',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@resttek.com',
            passwordHash: 'dummyHash',
            role: 'manager',
            restaurantId: 'r1'
        })

        expect(employee.id).toBe('123')
        expect(employee.firstName).toBe('John')
        expect(employee.lastName).toBe('Doe')
        expect(employee.email).toBe('john@resttek.com')
        expect(employee.role).toBe('manager')
        expect(employee.restaurantId).toBe('r1')
    })

    it('should create an admin without restaurantId', () => {
        const employee = Employee.create({
            id: 'a1',
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@resttek.com',
            passwordHash: 'hash',
            role: 'admin',
            restaurantId: null
        })

        expect(employee.role).toBe('admin')
        expect(employee.restaurantId).toBeNull()
    })

    it('should throw FirstNameRequiredError for empty first name', () => {
        expect(() => Employee.create({
            id: '1',
            firstName: '',
            lastName: 'Doe',
            email: 'john@resttek.com',
            passwordHash: 'hash',
            role: 'manager',
            restaurantId: null
        })).toThrow('First name is required')
    })

    it('should throw LastNameRequiredError for empty last name', () => {
        expect(() => Employee.create({
            id: '1',
            firstName: 'John',
            lastName: '',
            email: 'john@resttek.com',
            passwordHash: 'hash',
            role: 'manager',
            restaurantId: null
        })).toThrow('Last name is required')
    })

    it('should throw InvalidEmailError for invalid email', () => {
        expect(() => Employee.create({
            id: '1',
            firstName: 'John',
            lastName: 'Doe',
            email: 'invalid',
            passwordHash: 'hash',
            role: 'manager',
            restaurantId: null
        })).toThrow('Invalid email format')
    })

    it('should throw PasswordHashRequiredError for empty password hash', () => {
        expect(() => Employee.create({
            id: '1',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@resttek.com',
            passwordHash: '',
            role: 'manager',
            restaurantId: null
        })).toThrow('Password hash is required')
    })
})
