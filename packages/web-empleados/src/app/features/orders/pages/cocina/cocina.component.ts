import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { AuthStore } from '@resttek/web-shared';
import { OrderStore } from '../../store/order.store';

@Component({
  selector: 'app-cocina',
  standalone: true,
  templateUrl: './cocina.component.html',
  styleUrl: './cocina.component.css'
})
export class CocinaComponent implements OnInit, OnDestroy {
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

  get pendingAndPreparingOrders() {
    return this.orderStore.orders().map(order => ({
      ...order,
      items: order.items.filter(item => 
        item.dishCategory?.toLowerCase() !== 'bebida' &&
        (item.status === 'pendiente' || item.status === 'preparando')
      )
    })).filter(order => order.items.length > 0);
  }

  markPreparing(orderId: string, itemId: string): void {
    this.orderStore.updateItemStatus(orderId, itemId, 'preparando');
  }

  markReady(orderId: string, itemId: string): void {
    this.orderStore.updateItemStatus(orderId, itemId, 'listo');
  }

  getStatusClass(status: string): string {
    return `badge badge-${status}`;
  }
}
