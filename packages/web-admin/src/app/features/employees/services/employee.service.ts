import { Injectable, inject } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { environment } from '../../../../environments/environment'
import type { Employee, CreateEmployeeDto } from '../models/employee.model'

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private readonly http = inject(HttpClient)
  private readonly baseUrl = `${environment.apiUrl}/employees`

  getAll() {
    return this.http.get<Employee[]>(this.baseUrl)
  }

  getById(id: string) {
    return this.http.get<Employee>(`${this.baseUrl}/${id}`)
  }

  create(dto: CreateEmployeeDto) {
    return this.http.post<Employee>(this.baseUrl, dto)
  }

  getByRestaurant(restaurantId: string) {
    return this.http.get<Employee[]>(`${environment.apiUrl}/restaurants/${restaurantId}/employees`)
  }
}
