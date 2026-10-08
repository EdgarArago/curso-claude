import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import type { IAuthService } from '@employee/domain/IAuthService.js'

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-resttek-key'
const SALT_ROUNDS = 10

export class BcryptAuthService implements IAuthService {
    async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, SALT_ROUNDS)
    }

    async comparePasswords(provided: string, stored: string): Promise<boolean> {
        return bcrypt.compare(provided, stored)
    }

    generateToken(payload: any): string {
        return jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' })
    }
}
