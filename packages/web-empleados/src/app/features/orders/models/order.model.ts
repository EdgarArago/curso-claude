export type OrderStatus = 'pendiente' | 'preparando' | 'listo' | 'entregado'

export interface OrderItem {
  id: string
  dishId: string
  quantity: number
  notes: string | null
  status: OrderStatus
  dishName?: string
  dishPrice?: number
  dishCategory?: string
}

export interface Order {
  id: string
  restaurantId: string
  tableId: string | null
  clientId: string | null
  createdAt: string
  items: OrderItem[]
}

export interface UpdateOrderItemStatusDto {
  status: OrderStatus
}
