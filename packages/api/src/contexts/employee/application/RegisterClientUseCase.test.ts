import { describe, it, expect, vi, beforeEach } from 'vitest'
import { RegisterClientUseCase } from '@employee/application/RegisterClientUseCase.js'
import type { IEmployeeRepository } from '@employee/domain/IEmployeeRepository.js'
import type { IAuthService } from '@employee/domain/IAuthService.js'
import { DuplicatedEmailError } from '@errors/DomainErrors.js'

describe('RegisterClientUseCase', () => {
    let mockEmployeeRepo: Partial<IEmployeeRepository>
    let mockAuthService: Partial<IAuthService>
    let useCase: RegisterClientUseCase

    beforeEach(() => {
        mockEmployeeRepo = {
            findByEmail: vi.fn(),
            save: vi.fn()
        }
        mockAuthService = {
            hashPassword: vi.fn().mockResolvedValue('hashedPassword'),
            generateToken: vi.fn().mockReturnValue('mockToken')
        }
        useCase = new RegisterClientUseCase(
            mockEmployeeRepo as IEmployeeRepository,
            mockAuthService as IAuthService
        )
    })

    it('should register a new client and return token + employee data', async () => {
        vi.mocked(mockEmployeeRepo.findByEmail!).mockResolvedValue(null)

        const result = await useCase.execute({
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            password: 'password123'
        })

        expect(result.token).toBe('mockToken')
        expect(result.employee).toMatchObject({
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            role: 'cliente',
            restaurantId: null
        })
        expect(mockEmployeeRepo.save).toHaveBeenCalledOnce()
    })

    it('should throw DuplicatedEmailError when email already exists', async () => {
        vi.mocked(mockEmployeeRepo.findByEmail!).mockResolvedValue({
            id: 'existing-id',
            firstName: 'Existing',
            lastName: 'User',
            email: 'john@example.com',
            passwordHash: 'hash',
            role: 'cliente',
            restaurantId: null
        } as any)

        await expect(useCase.execute({
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            password: 'password123'
        })).rejects.toThrow(DuplicatedEmailError)

        expect(mockEmployeeRepo.save).not.toHaveBeenCalled()
    })
})
