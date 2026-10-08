import { MockEmployeeRepository, MockAuthService } from '@employee/application/mocks/MockDependencies.js'
import { CreateEmployeeUseCase } from '@employee/application/CreateEmployeeUseCase.js'
import { LoginUseCase } from '@employee/application/LoginUseCase.js'
import { Employee } from '@employee/domain/Employee.js'
import { describe, it, expect, beforeEach } from 'vitest'

describe('Employee Application Use Cases', () => {
    let employeeRepo: MockEmployeeRepository
    let authService: MockAuthService
    let createEmployeeUseCase: CreateEmployeeUseCase
    let loginUseCase: LoginUseCase

    beforeEach(() => {
        employeeRepo = new MockEmployeeRepository()
        authService = new MockAuthService()
        createEmployeeUseCase = new CreateEmployeeUseCase(employeeRepo, authService)
        loginUseCase = new LoginUseCase(employeeRepo, authService)
    })

    describe('CreateEmployeeUseCase', () => {
        it('should create and save a new employee', async () => {
            const dto = {
                firstName: 'Alice',
                lastName: 'Smith',
                email: 'alice@resttek.com',
                passwordPlain: 'securepassword123',
                role: 'cocinero',
                restaurantId: 'r1'
            }

            const result = await createEmployeeUseCase.execute(dto)

            expect(result.id).toBeDefined()
            expect(result.email).toBe('alice@resttek.com')
            expect(result.passwordHash).toBe('hashed_securepassword123')
            expect(result.role).toBe('cocinero')
            expect(result.restaurantId).toBe('r1')

            const saved = await employeeRepo.findByEmail('alice@resttek.com')
            expect(saved).not.toBeNull()
        })

        it('should throw DuplicatedEmailError if email already exists', async () => {
            await createEmployeeUseCase.execute({
                firstName: 'Alice',
                lastName: 'Smith',
                email: 'alice@resttek.com',
                passwordPlain: 'pass',
                role: 'manager',
                restaurantId: 'r1'
            })

            await expect(createEmployeeUseCase.execute({
                firstName: 'Bob',
                lastName: 'Jones',
                email: 'alice@resttek.com',
                passwordPlain: 'pass2',
                role: 'camarero',
                restaurantId: 'r1'
            })).rejects.toThrow('Email is already in use')
        })
    })

    describe('LoginUseCase', () => {
        it('should return token for valid credentials', async () => {
            const employee = Employee.create({
                id: '123',
                firstName: 'Admin',
                lastName: 'User',
                email: 'admin@resttek.com',
                passwordHash: 'hashed_password123',
                role: 'admin',
                restaurantId: null
            })
            await employeeRepo.save(employee)

            const result = await loginUseCase.execute({
                email: 'admin@resttek.com',
                passwordRaw: 'password123'
            })

            expect(result.token).toBe('fake-jwt-token-for-123')
            expect(result.employee.role).toBe('admin')
        })

        it('should throw InvalidCredentialsError for non-existent email', async () => {
            await expect(loginUseCase.execute({
                email: 'nobody@resttek.com',
                passwordRaw: 'password123'
            })).rejects.toThrow('Invalid credentials')
        })

        it('should throw InvalidCredentialsError for wrong password', async () => {
            const employee = Employee.create({
                id: '123',
                firstName: 'Admin',
                lastName: 'User',
                email: 'admin@resttek.com',
                passwordHash: 'hashed_password123',
                role: 'admin',
                restaurantId: null
            })
            await employeeRepo.save(employee)

            await expect(loginUseCase.execute({
                email: 'admin@resttek.com',
                passwordRaw: 'wrongpassword'
            })).rejects.toThrow('Invalid credentials')
        })
    })
})
