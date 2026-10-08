import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core'
import { RouterLink } from '@angular/router'
import { DatePipe, DecimalPipe } from '@angular/common'
import { OrderService } from '../../core/services/order.service'
import { Order } from '../../core/models/order.model'

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [RouterLink, DatePipe, DecimalPipe],
  template: `
    <div class="container">
      <div class="page-header">
        <h1>Mis Pedidos</h1>
      </div>

      @if (loading()) {
        <div class="spinner"></div>
      } @else if (error()) {
        <div class="alert-error">{{ error() }}</div>
      } @else if (orders().length === 0) {
        <div class="empty-state card">
          <p>No tienes pedidos todavía</p>
          <a routerLink="/restaurants" class="btn btn-primary" style="margin-top: 16px;">
            Ver restaurantes
          </a>
        </div>
      } @else {
        <div class="orders-list">
          @for (order of orders(); track order.id) {
            <a [routerLink]="['/orders', order.id]" class="order-card card">
              <div class="order-header">
                <span class="order-date">{{ order.createdAt | date:'dd/MM/yyyy HH:mm' }}</span>
                <span class="order-status" [class]="'status-' + getMainStatus(order)">
                  {{ getStatusLabel(getMainStatus(order)) }}
                </span>
              </div>
              <div class="order-info">
                <span class="restaurant-name">{{ order.restaurantName }}</span>
                <span class="order-meta">
                  <span>{{ order.items.length }} {{ order.items.length === 1 ? 'artículo' : 'artículos' }}</span>
                  <span class="order-total">{{ getOrderTotal(order) | number:'1.2-2' }} €</span>
                </span>
              </div>
            </a>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .container {
      max-width: 800px;
      margin: 0 auto;
    }
    .orders-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .order-card {
      display: block;
      padding: 20px;
      transition: all var(--transition);
    }
    .order-card:hover {
      border-color: var(--green-medium);
    }
    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .order-date {
      font-weight: 600;
    }
    .order-status {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;
    }
    .status-pendiente {
      background: rgba(250, 204, 21, 0.15);
      color: var(--yellow);
    }
    .status-preparando {
      background: rgba(59, 130, 246, 0.15);
      color: #3b82f6;
    }
    .status-listo {
      background: var(--green-glow);
      color: var(--green-light);
    }
    .status-entregado {
      background: rgba(139, 146, 168, 0.1);
      color: var(--text-secondary);
    }
    .order-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: var(--text-muted);
      font-size: 13px;
    }
    .restaurant-name {
      font-weight: 500;
      color: var(--text-primary);
    }
    .order-meta {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .order-total {
      font-weight: 600;
      color: var(--green-light);
    }
  `]
})
export class MyOrdersComponent implements OnInit, OnDestroy {
  private readonly orderService = inject(OrderService)
  private pollInterval: ReturnType<typeof setInterval> | null = null

  readonly orders = signal<Order[]>([])
  readonly loading = signal(true)
  readonly error = signal<string | null>(null)

  ngOnInit(): void {
    this.loadOrders()
    this.pollInterval = setInterval(() => this.loadOrders(false), 10000)
  }

  ngOnDestroy(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval)
    }
  }

  private loadOrders(showLoading = true): void {
    if (showLoading) this.loading.set(true)
    this.orderService.getMyOrders().subscribe({
      next: (orders) => {
        this.orders.set(orders)
        this.loading.set(false)
      },
      error: () => {
        this.error.set('Error al cargar los pedidos')
        this.loading.set(false)
      }
    })
  }

  getMainStatus(order: Order): string {
    if (order.items.every(i => i.status === 'entregado')) return 'entregado'
    if (order.items.some(i => i.status === 'listo')) return 'listo'
    if (order.items.some(i => i.status === 'preparando')) return 'preparando'
    return 'pendiente'
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pendiente: 'Pendiente',
      preparando: 'En preparación',
      listo: 'Listo',
      entregado: 'Entregado'
    }
    return labels[status] || status
  }

  getOrderTotal(order: Order): number {
    return order.items.reduce((sum, item) => sum + (item.dishPrice || 0) * item.quantity, 0)
  }
}
