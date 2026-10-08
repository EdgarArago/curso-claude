import { Component, inject, OnInit, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { ActivatedRoute, Router, RouterLink } from '@angular/router'
import { LucideAngularModule } from 'lucide-angular'
import { firstValueFrom } from 'rxjs'
import { RestaurantStore } from '../../store/restaurant.store'
import { RestaurantService } from '../../services/restaurant.service'
import type { CreateRestaurantDto } from '../../models/restaurant.model'

@Component({
  selector: 'app-restaurant-form',
  standalone: true,
  imports: [FormsModule, RouterLink, LucideAngularModule],
  templateUrl: './restaurant-form.component.html',
  styleUrl: './restaurant-form.component.css'
})
export class RestaurantFormComponent implements OnInit {
  private readonly store = inject(RestaurantStore)
  private readonly service = inject(RestaurantService)
  private readonly route = inject(ActivatedRoute)
  private readonly router = inject(Router)

  isEditing = false
  restaurantId: string | null = null
  loading = signal(false)
  error = signal<string | null>(null)

  form: CreateRestaurantDto = {
    name: '',
    address: '',
    email: '',
    phone: '',
    ownerFirstName: '',
    ownerLastName: '',
    logoUrl: null
  }

  get pageTitle(): string {
    return this.isEditing ? 'Editar restaurante' : 'Nuevo restaurante'
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')
    if (id) {
      this.isEditing = true
      this.restaurantId = id
      this.loadRestaurant(id)
    }
  }

  private async loadRestaurant(id: string): Promise<void> {
    this.loading.set(true)
    try {
      const restaurant = await firstValueFrom(this.service.getById(id))
      this.form = {
        name: restaurant.name,
        address: restaurant.address,
        email: restaurant.email,
        phone: restaurant.phone,
        ownerFirstName: restaurant.ownerFirstName,
        ownerLastName: restaurant.ownerLastName,
        logoUrl: restaurant.logoUrl
      }
    } catch {
      this.error.set('No se pudo cargar el restaurante.')
    } finally {
      this.loading.set(false)
    }
  }

  async onSubmit(): Promise<void> {
    this.error.set(null)
    this.loading.set(true)
    try {
      if (this.isEditing && this.restaurantId) {
        await this.store.update(this.restaurantId, this.form)
      } else {
        await this.store.create(this.form)
      }
      this.router.navigate(['/restaurants'])
    } catch (err: any) {
      this.error.set(err?.error?.message ?? 'Error al guardar el restaurante.')
    } finally {
      this.loading.set(false)
    }
  }
}
