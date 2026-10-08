# RestTek - Web Empleados

Aplicación Angular para empleados del restaurante (Camareros, Cocineros, Gerentes).

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

La aplicación estará disponible en `http://localhost:4201`

## Roles y Permisos

### Camarero
- **Barra**: Ve bebidas pendientes y puede marcarlas como "Listo"
- **Salón**: Ve productos listos para entregar y puede marcarlos como "Entregado"

### Cocinero
- **Cocina**: Ve platos pendientes y en preparación, puede:
  - Marcar como "Preparando" (pendiente → preparando)
  - Marcar como "Listo" (preparando → listo)

### Gerente
- Acceso completo a todas las secciones: Cocina, Barra y Salón
- Puede realizar todas las acciones disponibles

## Estados de los Items

| Estado | Descripción | Color |
|--------|-------------|-------|
| `pendiente` | Item nuevo, esperando procesamiento | Amarillo |
| `preparando` | Item siendo preparado | Naranja |
| `listo` | Item listo para servir/entregar | Verde |
| `entregado` | Item entregado al cliente | Gris (desaparece de la vista) |

## Características

- **Auto-refresh**: Los pedidos se actualizan automáticamente cada 30 segundos
- **Diseño responsive**: Interfaz optimizada para tablets y pantallas de cocina
- **Notificaciones visuales**: Badges de color según estado del item

## Estructura del Proyecto

```
src/app/
├── core/
│   └── layout/           # Shell component (sidebar + main content)
└── features/
    └── orders/
        ├── models/      # Interfaces de Order, OrderItem
        ├── services/    # OrderService (API calls)
        ├── store/       # OrderStore (state management con signals)
        └── pages/       # Cocina, Barra, Salon
```

## API Endpoints

La aplicación consume los siguientes endpoints del backend:

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1/orders/active?restaurantId=` | Obtener pedidos activos |
| PATCH | `/api/v1/orders/:orderId/items/:itemId/status` | Actualizar estado de item |

## Build

Para hacer build de producción:

```bash
npm run build
```

Los archivos generados estarán en `dist/web-empleados/browser/`
