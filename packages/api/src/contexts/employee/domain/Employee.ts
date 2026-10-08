import { Email } from '@shared/domain/value-objects/Email.js'
import { Role } from '@employee/domain/value-objects/Role.js'
import type { EmployeeRoleType } from '@employee/domain/value-objects/Role.js'
import { FirstNameRequiredError, LastNameRequiredError, PasswordHashRequiredError } from '@errors/DomainErrors.js'

export interface EmployeeProps {
    id: string
    firstName: string
    lastName: string
    email: string
    passwordHash: string
    role: string
    restaurantId: string | null
}

export class Employee {
    private _id: string
    private _firstName: string
    private _lastName: string
    private _email: Email
    private _passwordHash: string
    private _role: Role
    private _restaurantId: string | null

    private constructor(props: {
        id: string
        firstName: string
        lastName: string
        email: Email
        passwordHash: string
        role: Role
        restaurantId: string | null
    }) {
        this._id = props.id
        this._firstName = props.firstName
        this._lastName = props.lastName
        this._email = props.email
        this._passwordHash = props.passwordHash
        this._role = props.role
        this._restaurantId = props.restaurantId
    }

    public static create(props: EmployeeProps): Employee {
        if (!props.firstName || props.firstName.trim() === '') {
            throw new FirstNameRequiredError()
        }
        if (!props.lastName || props.lastName.trim() === '') {
            throw new LastNameRequiredError()
        }
        if (!props.passwordHash || props.passwordHash.trim() === '') {
            throw new PasswordHashRequiredError()
        }

        return new Employee({
            id: props.id,
            firstName: props.firstName,
            lastName: props.lastName,
            email: new Email(props.email),
            passwordHash: props.passwordHash,
            role: new Role(props.role),
            restaurantId: props.restaurantId
        })
    }

    get id(): string { return this._id }
    get firstName(): string { return this._firstName }
    get lastName(): string { return this._lastName }
    get email(): string { return this._email.getValue() }
    get passwordHash(): string { return this._passwordHash }
    get role(): EmployeeRoleType { return this._role.getValue() }
    get restaurantId(): string | null { return this._restaurantId }
}
