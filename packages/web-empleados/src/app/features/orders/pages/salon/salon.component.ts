import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { AuthStore } from '@resttek/web-shared';
import { OrderStore } from '../../store/order.store';

@Component({
  selector: 'app-salon',
  standalone: true,
  templateUrl: './salon.component.html',
  styleUrl: './salon.component.css'
})
export class SalonComponent implements OnInit, OnDestroy {
  private readonly authStore = inject(AuthStore);
  readonly orderStore = inject(OrderStore);

  ngOnInit(): void {
    const restaurantId = this.authStore.user()?.restaurantId;
    if (restaurantId) {
      this.orderStore.startPolling(restaurantId);
    }
  }

  ngOnDestroy(): void {
    this.orderStore.stopPolling();
  }

  get readyOrders() {
    return this.orderStore.orders().map(order => ({
      ...order,
      items: order.items.filter(item => item.status === 'listo')
    })).filter(order => order.items.length > 0);
  }

  deliver(orderId: string, itemId: string): void {
    this.orderStore.updateItemStatus(orderId, itemId, 'entregado');
  }

  getStatusClass(status: string): string {
    return `badge badge-${status}`;
  }
}
