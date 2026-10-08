import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order, UpdateOrderItemStatusDto } from '../models/order.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/orders`;

  getActiveOrders(restaurantId: string): Observable<Order[]> {
    const params = new HttpParams().set('restaurantId', restaurantId);
    return this.http.get<Order[]>(`${this.baseUrl}/active`, { params });
  }

  updateItemStatus(orderId: string, itemId: string, dto: UpdateOrderItemStatusDto): Observable<void> {
    return this.http.patch<void>(
      `${this.baseUrl}/${orderId}/items/${itemId}/status`,
      dto
    );
  }
}
