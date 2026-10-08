export type EmployeeRole = 'admin' | 'manager' | 'camarero' | 'cocinero'

export interface Employee {
  id: string
  firstName: string
  lastName: string
  email: string
  role: EmployeeRole
  restaurantId: string | null
}

export interface CreateEmployeeDto {
  firstName: string
  lastName: string
  email: string
  password: string
  role: EmployeeRole
  restaurantId: string | null
}
