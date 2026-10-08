import { Component, inject, OnInit } from '@angular/core'
import { ActivatedRoute, RouterLink } from '@angular/router'
import { LucideAngularModule } from 'lucide-angular'
import { EmployeeStore } from '../../store/employee.store'

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './employee-list.component.html',
  styleUrl: './employee-list.component.css'
})
export class EmployeeListComponent implements OnInit {
  readonly store = inject(EmployeeStore)
  private readonly route = inject(ActivatedRoute)
  restaurantId = ''

  ngOnInit(): void {
    this.restaurantId = this.route.parent?.snapshot.params['restaurantId'] ?? ''
    if (this.restaurantId) {
      this.store.loadByRestaurant(this.restaurantId)
    }
  }

  getRoleBadgeClass(role: string): string {
    return role === 'admin' ? 'badge' : 'badge badge-muted'
  }
}
