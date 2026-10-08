# RestTek - Web Admin

Panel de administración Angular para gestionar restaurantes, platos, ingredientes y empleados.

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

La aplicación estará disponible en `http://localhost:4200`

## Funcionalidades

### Dashboard
Vista general con el listado de restaurantes.

### Restaurantes
- Listado, alta y edición de restaurantes.
- Cada restaurante tiene su propio dashboard con accesos a platos, ingredientes y empleados.

### Platos
- CRUD de platos por restaurante: nombre, descripción, precio, categoría (entrante, principal, postre, bebida), disponibilidad e ingredientes asociados.

### Ingredientes
- CRUD de ingredientes por restaurante: nombre, unidad y stock.

### Empleados
- Alta y listado de empleados por restaurante.
- Roles asignables desde el formulario: `manager`, `camarero`, `cocinero`.

## Estructura del Proyecto

```
src/app/
├── core/
│   └── layout/            # Shell component (sidebar + navegación) y página 404
└── features/
    ├── dashboard/          # Vista general
    ├── restaurants/        # models/services/store/pages: listado, alta, edición, dashboard por restaurante
    ├── dishes/             # models/services/store/pages: CRUD de platos
    ├── ingredients/        # models/services/store/pages: CRUD de ingredientes
    └── employees/          # models/services/store/pages: alta y listado de empleados
```

## Build

Para hacer build de producción:

```bash
npm run build
```

Los archivos generados estarán en `dist/web-admin/browser/`
