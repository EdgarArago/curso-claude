import { randomUUID } from 'crypto'
import { Employee } from '@employee/domain/Employee.js'
import type { IEmployeeRepository } from '@employee/domain/IEmployeeRepository.js'
import type { IAuthService } from '@employee/domain/IAuthService.js'
import { DuplicatedEmailError } from '@errors/DomainErrors.js'

export interface RegisterClientDTO {
    firstName: string
    lastName: string
    email: string
    password: string
}

export interface RegisterClientResponse {
    token: string
    employee: {
        id: string
        firstName: string
        lastName: string
        email: string
        role: string
        restaurantId: string | null
    }
}

export class RegisterClientUseCase {
    constructor(
        private readonly employeeRepo: IEmployeeRepository,
        private readonly authService: IAuthService
    ) {}

    async execute(dto: RegisterClientDTO): Promise<RegisterClientResponse> {
        const existingEmployee = await this.employeeRepo.findByEmail(dto.email)
        if (existingEmployee) {
            throw new DuplicatedEmailError()
        }

        const passwordHash = await this.authService.hashPassword(dto.password)

        const employee = Employee.create({
            id: randomUUID(),
            firstName: dto.firstName,
            lastName: dto.lastName,
            email: dto.email,
            passwordHash,
            role: 'cliente',
            restaurantId: null
        })

        await this.employeeRepo.save(employee)

        const token = this.authService.generateToken({
            id: employee.id,
            role: employee.role,
            restaurantId: employee.restaurantId
        })

        return {
            token,
            employee: {
                id: employee.id,
                firstName: employee.firstName,
                lastName: employee.lastName,
                email: employee.email,
                role: employee.role,
                restaurantId: employee.restaurantId
            }
        }
    }
}
