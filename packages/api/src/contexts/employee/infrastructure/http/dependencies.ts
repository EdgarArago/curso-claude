import { AuthController } from '@employee/infrastructure/http/AuthController.js'
import { EmployeeController } from '@employee/infrastructure/http/EmployeeController.js'
import { dbConfig } from '@config/database.js'
import { SqliteEmployeeRepository } from '@employee/infrastructure/SqliteEmployeeRepository.js'
import { BcryptAuthService } from '@employee/infrastructure/BcryptAuthService.js'
import { LoginUseCase } from '@employee/application/LoginUseCase.js'
import { CreateEmployeeUseCase } from '@employee/application/CreateEmployeeUseCase.js'
import { RegisterClientUseCase } from '@employee/application/RegisterClientUseCase.js'

const employeeRepository = new SqliteEmployeeRepository(dbConfig)
const authService = new BcryptAuthService()
const loginUseCase = new LoginUseCase(employeeRepository, authService)
const createEmployeeUseCase = new CreateEmployeeUseCase(employeeRepository, authService)
const registerClientUseCase = new RegisterClientUseCase(employeeRepository, authService)

export const authController = new AuthController(loginUseCase, registerClientUseCase)
export const employeeController = new EmployeeController(
    createEmployeeUseCase,
    employeeRepository
)
