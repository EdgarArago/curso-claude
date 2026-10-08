import { Database } from '@config/database.js'
import type { Order, OrderItem } from '@models/order.model.js'
import { normalizeOrderStatus } from '@models/order.model.js'

interface OrderRow {
    id: string
    restaurant_id: string
    table_id: string | null
    client_id: string | null
    created_at: string
}

interface OrderRowWithRestaurant extends OrderRow {
    restaurant_name: string
    restaurant_logo_url: string | null
}

interface OrderItemRow {
    id: string
    order_id: string
    dish_id: string
    quantity: number
    notes: string | null
    status: string
}

interface OrderItemWithDishRow extends OrderItemRow {
    dish_name: string
    dish_price: number
    dish_category: string
}

export interface OrderRepository {
    create(order: Order): Promise<void>
    findById(id: string): Promise<Order | null>
    updateItemStatus(orderId: string, itemId: string, status: string): Promise<void>
    findActiveByRestaurant(restaurantId: string): Promise<Order[]>
    findByClientId(clientId: string): Promise<Order[]>
}

export class SqliteOrderRepository implements OrderRepository {
    constructor(private readonly db: Database) {}

    async create(order: Order): Promise<void> {
        await this.db.run(
            'INSERT INTO orders (id, restaurant_id, table_id, client_id, created_at) VALUES (?, ?, ?, ?, ?)',
            [order.id, order.restaurantId, order.tableId, order.clientId, order.createdAt.toISOString()]
        )

        for (const item of order.items) {
            await this.db.run(
                'INSERT INTO order_items (id, order_id, dish_id, quantity, notes, status) VALUES (?, ?, ?, ?, ?, ?)',
                [item.id, order.id, item.dishId, item.quantity, item.notes, item.status]
            )
        }
    }

    async findById(id: string): Promise<Order | null> {
        const orderRow = await this.db.get<OrderRowWithRestaurant>(
            `SELECT o.*, r.name as restaurant_name, r.logo_url as restaurant_logo_url
             FROM orders o
             LEFT JOIN restaurants r ON o.restaurant_id = r.id
             WHERE o.id = ?`,
            [id]
        )
        if (!orderRow) return null

        const items = await this.getOrderItems(id)

        return {
            id: orderRow.id,
            restaurantId: orderRow.restaurant_id,
            tableId: orderRow.table_id,
            clientId: orderRow.client_id,
            createdAt: new Date(orderRow.created_at),
            items,
            restaurantName: orderRow.restaurant_name,
            restaurantLogoUrl: orderRow.restaurant_logo_url
        }
    }

    async updateItemStatus(orderId: string, itemId: string, status: string): Promise<void> {
        await this.db.run(
            'UPDATE order_items SET status = ? WHERE id = ? AND order_id = ?',
            [status, itemId, orderId]
        )
    }

    async findActiveByRestaurant(restaurantId: string): Promise<Order[]> {
        const query = `
            SELECT DISTINCT o.*
            FROM orders o
            JOIN order_items oi ON o.id = oi.order_id
            WHERE o.restaurant_id = ? AND oi.status != 'entregado'
            ORDER BY o.created_at ASC
        `
        const orderRows = await this.db.all<OrderRow>(query, [restaurantId])

        const orders: Order[] = []
        for (const row of orderRows) {
            const items = await this.getOrderItems(row.id)
            orders.push({
                id: row.id,
                restaurantId: row.restaurant_id,
                tableId: row.table_id,
                clientId: row.client_id,
                createdAt: new Date(row.created_at),
                items
            })
        }

        return orders
    }

    async findByClientId(clientId: string): Promise<Order[]> {
        const orderRows = await this.db.all<OrderRowWithRestaurant>(
            `SELECT o.*, r.name as restaurant_name, r.logo_url as restaurant_logo_url
             FROM orders o
             LEFT JOIN restaurants r ON o.restaurant_id = r.id
             WHERE o.client_id = ?
             ORDER BY o.created_at DESC`,
            [clientId]
        )

        const orders: Order[] = []
        for (const row of orderRows) {
            const items = await this.getOrderItems(row.id)
            orders.push({
                id: row.id,
                restaurantId: row.restaurant_id,
                tableId: row.table_id,
                clientId: row.client_id,
                createdAt: new Date(row.created_at),
                items,
                restaurantName: row.restaurant_name,
                restaurantLogoUrl: row.restaurant_logo_url
            })
        }

        return orders
    }

    private async getOrderItems(orderId: string): Promise<OrderItem[]> {
        const itemRows = await this.db.all<OrderItemWithDishRow>(`
            SELECT oi.*, d.name as dish_name, d.price as dish_price, d.category as dish_category
            FROM order_items oi
            LEFT JOIN dishes d ON oi.dish_id = d.id
            WHERE oi.order_id = ?
        `, [orderId])

        return itemRows.map(row => ({
            id: row.id,
            dishId: row.dish_id,
            quantity: row.quantity,
            notes: row.notes,
            status: normalizeOrderStatus(row.status),
            dishName: row.dish_name,
            dishPrice: row.dish_price,
            dishCategory: row.dish_category
        }))
    }
}
