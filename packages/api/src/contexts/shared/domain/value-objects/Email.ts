import { InvalidEmailError } from '@errors/DomainErrors.js'

export class Email {
    private readonly value: string

    constructor(value: string) {
        if (!this.isValid(value)) {
            throw new InvalidEmailError()
        }
        this.value = value
    }

    private isValid(email: string): boolean {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return regex.test(email)
    }

    public getValue(): string {
        return this.value
    }
}
