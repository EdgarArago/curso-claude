export interface IAuthService {
    hashPassword(password: string): Promise<string>
    comparePasswords(provided: string, stored: string): Promise<boolean>
    generateToken(payload: any): string
}
