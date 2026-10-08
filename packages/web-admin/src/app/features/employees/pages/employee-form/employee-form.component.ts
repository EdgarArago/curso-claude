import { Component, inject, OnInit, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { ActivatedRoute, Router, RouterLink } from '@angular/router'
import { LucideAngularModule } from 'lucide-angular'
import { EmployeeStore } from '../../store/employee.store'
import type { CreateEmployeeDto, EmployeeRole } from '../../models/employee.model'

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [FormsModule, RouterLink, LucideAngularModule],
  templateUrl: './employee-form.component.html',
  styleUrl: './employee-form.component.css'
})
export class EmployeeFormComponent implements OnInit {
  private readonly store = inject(EmployeeStore)
  private readonly route = inject(ActivatedRoute)
  private readonly router = inject(Router)

  loading = signal(false)
  error = signal<string | null>(null)
  restaurantId = ''

  roles: EmployeeRole[] = ['manager', 'camarero', 'cocinero']

  form: CreateEmployeeDto = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'camarero',
    restaurantId: null
  }

  get listUrl(): string {
    return `/restaurants/${this.restaurantId}/employees`
  }

  ngOnInit(): void {
    this.restaurantId = this.route.parent?.snapshot.params['restaurantId'] ?? ''
    this.form.restaurantId = this.restaurantId || null
  }

  async onSubmit(): Promise<void> {
    this.error.set(null)
    this.loading.set(true)
    try {
      await this.store.create(this.form)
      this.router.navigate(['/restaurants', this.restaurantId, 'employees'])
    } catch (err: any) {
      this.error.set(err?.error?.message ?? 'Error al crear el empleado.')
    } finally {
      this.loading.set(false)
    }
  }
}
