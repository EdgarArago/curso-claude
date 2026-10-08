import type { Employee } from '@employee/domain/Employee.js'

export interface IEmployeeRepository {
    findById(id: string): Promise<Employee | null>
    findByEmail(email: string): Promise<Employee | null>
    findAll(limit?: number, offset?: number, role?: string): Promise<Employee[]>
    findByRestaurant(restaurantId: string): Promise<Employee[]>
    save(employee: Employee): Promise<void>
    delete(id: string): Promise<void>
}
