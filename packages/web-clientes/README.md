# RestTek - Web Clientes

Aplicación Angular para que los clientes de un restaurante consulten la carta, hagan pedidos y sigan su estado.

## Requisitos

- Node.js 22+
- npm 10+

## Instalación

```bash
npm install
```

## Desarrollo

Para iniciar el servidor de desarrollo:

```bash
npm start
```

La aplicación estará disponible en `http://localhost:4202`

## Funcionalidades

### Restaurantes
- Listado de restaurantes disponibles.

### Carta
- Consulta de la carta de un restaurante (platos por categoría: entrante, principal, postre, bebida).

### Carrito
- Añadir platos al carrito y confirmar el pedido.
- El carrito es local (no se persiste vía API) y se vacía automáticamente si se añade un plato de un restaurante distinto al que ya había en curso.

### Pedidos
- "Mis pedidos": listado de los pedidos del cliente autenticado, con auto-refresco cada 10 segundos.
- Detalle de un pedido con el estado de cada ítem (`pendiente`, `preparando`, `listo`, `entregado`).

## Estructura del Proyecto

```
src/app/
├── core/
│   ├── layout/      # Shell component (navegación)
│   ├── models/       # Interfaces de Restaurant, Dish, Order
│   ├── services/     # RestaurantService, DishService, OrderService (API calls)
│   └── store/         # CartStore (estado del carrito, local, sin HTTP)
└── features/
    ├── restaurants/   # Listado de restaurantes
    ├── menu/          # Carta de un restaurante
    ├── cart/           # Carrito y confirmación de pedido
    └── orders/         # Mis pedidos y detalle de pedido
```

A diferencia de `web-admin` y `web-empleados`, la mayoría de componentes de `features/` consumen los servicios HTTP directamente con `.subscribe()` en vez de pasar por un store: el único store con estado es `CartStore`, que es puramente local.

## Build

Para hacer build de producción:

```bash
npm run build
```

Los archivos generados estarán en `dist/web-clientes/browser/`
