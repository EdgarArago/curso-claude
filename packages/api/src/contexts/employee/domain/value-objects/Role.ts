import { InvalidRoleError } from '@errors/DomainErrors.js'

export type EmployeeRoleType = 'admin' | 'manager' | 'camarero' | 'cocinero' | 'cliente'

const VALID_ROLES = ['admin', 'manager', 'camarero', 'cocinero', 'cliente']

export class Role {
    private readonly value: EmployeeRoleType

    constructor(value: string) {
        if (!value || typeof value !== 'string') {
            throw new InvalidRoleError('Role must be provided')
        }

        const normalizedValue = value.trim().toLowerCase()
        if (!VALID_ROLES.includes(normalizedValue)) {
            throw new InvalidRoleError(`Invalid role: ${value}. Must be one of: ${VALID_ROLES.join(', ')}`)
        }
        this.value = normalizedValue as EmployeeRoleType
    }

    public getValue(): EmployeeRoleType {
        return this.value
    }
}
