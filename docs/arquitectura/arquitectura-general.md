# Arquitectura general

## Visión Macro

Resttek es un **monorepo** gestionado con **npm workspaces** que contiene 5 paquetes: 1 backend Node.js y 4 paquetes Angular (3 aplicaciones + 1 librería compartida).

```mermaid
graph TB
    subgraph "Monorepo resttek"
        subgraph "Frontends (Angular 21)"
            WA["web-admin<br/>:4200"]
            WC["web-clientes<br/>:4202"]
            WE["web-empleados<br/>:4201"]
            WS["web-shared<br/>(librería)"]
        end

        API["api<br/>Express + TS<br/>:3000"]

        DB[(SQLite)]
    end

    WA --> WS
    WC --> WS
    WE --> WS

    WA -- "proxy /api" --> API
    WC -- "proxy /api" --> API
    WE -- "proxy /api" --> API

    API --> DB
```

---

## Estrategia de Monorepo

### npm Workspaces

El `package.json` raíz define todos los paquetes bajo `packages/*`:

```json
{
  "workspaces": ["packages/*"]
}
```

Esto permite:

- **Un solo `npm install`** instala las dependencias de todos los paquetes.
- **Referencias entre paquetes** usando el nombre npm (ej: `@resttek/web-shared`).
- **Scripts centralizados** para arrancar cualquier servicio desde la raíz.

### Scripts Disponibles desde la Raíz

| Comando | Qué hace |
| --- | --- |
| `npm run dev:api` | Arranca la API Node.js con hot-reload (tsx watch) |
| `npm run dev:admin` | Arranca web-admin en :4200 |
| `npm run dev:empleados` | Arranca web-empleados en :4201 |
| `npm run dev:clientes` | Arranca web-clientes en :4202 |
| `npm test` | Ejecuta los tests de la API |
| `npm run seed` | Puebla la base de datos con datos de prueba |

---

## Flujo de Datos

```mermaid
sequenceDiagram
    participant C as Cliente (Angular)
    participant P as Proxy Dev Server
    participant A as API (Express)
    participant D as SQLite

    C->>P: GET /api/v1/restaurants
    P->>A: GET /api/v1/restaurants
    A->>D: SELECT * FROM restaurants
    D-->>A: rows
    A-->>P: JSON response
    P-->>C: JSON response
```

### Proxy de Desarrollo

Cada frontend Angular tiene un `proxy.conf.json` que redirige las peticiones `/api` al backend:

```json
{
  "/api": {
    "target": "http://localhost:3000",
    "secure": false,
    "changeOrigin": true
  }
}
```

Esto elimina problemas de CORS en desarrollo y simula el comportamiento de producción donde frontend y API estarían bajo el mismo dominio.

---

## Separación de Responsabilidades

### Backend

En la API conviven **dos estilos arquitectónicos**:

- **Hexagonal con DDD** en el contexto `employee`: tres capas (Domain → Application → Infrastructure) bajo `src/contexts/employee/`.
- **Por capas** en `restaurant`, `dish`, `ingredient` y `order`: carpetas transversales `models/`, `repositories/`, `services/`, `controllers/` y `routes/`.

En ambos casos la capa HTTP (controladores y rutas) es un adaptador de entrada y el acceso a datos queda detrás de una interfaz de repositorio. Ver [Arquitectura de la API](./arquitectura-api.md) para detalles.

### Frontend

- **Angular 21** con componentes standalone y signals
- Arquitectura **feature-based**, con matices por aplicación: `web-admin` y `web-empleados` agrupan cada feature en `models/`, `pages/`, `services/` y `store/`; `web-clientes` centraliza modelos y servicios en `core/`
- Librería compartida (`web-shared`) para auth, interceptors y componentes comunes
- Ver [Arquitectura del Frontend](./arquitectura-frontend.md) para detalles

---

## Base de Datos

- **SQLite** como motor de persistencia
- Archivo: `packages/api/resttek.db`
- Las tablas se crean automáticamente al arrancar la API (migraciones en código)
- Con `NODE_ENV=test` se usa SQLite en memoria (`:memory:`)
- Ver [Modelo de Datos](../dominio/modelo-datos.md) para el esquema completo

---

## Autenticación

El sistema usa **JWT (JSON Web Tokens)** para autenticación:

```mermaid
sequenceDiagram
    participant U as Usuario
    participant F as Frontend
    participant A as API

    U->>F: Login (email + password)
    F->>A: POST /api/v1/auth/login
    A->>A: Verificar bcrypt hash
    A-->>F: { token, employee }
    F->>F: Guardar en localStorage
    F->>A: GET /api/v1/restaurants<br/>Authorization: Bearer <token>
    A->>A: Verificar JWT + permisos
    A-->>F: datos
```

- **Backend**: middleware `authenticate` verifica el JWT; `authorize` comprueba roles.
- **Frontend**: `AuthInterceptor` añade el token a cada petición; `AuthGuard` protege rutas.

---

## Relaciones entre Paquetes

```mermaid
graph LR
    WA["@resttek/web-admin"] --> WS["@resttek/web-shared"]
    WC["@resttek/web-clientes"] --> WS
    WE["@resttek/web-empleados"] --> WS

    WA -. "proxy /api" .-> API["@resttek/api"]
    WC -. "proxy /api" .-> API
    WE -. "proxy /api" .-> API

    style WS fill:#2a2f42,stroke:#4ade80,color:#e8eaf0
    style API fill:#2a2f42,stroke:#4ade80,color:#e8eaf0
```

- **`web-shared`** es la única dependencia compartida entre frontends.
- Los frontends **no dependen directamente entre sí**.
- La API no tiene dependencias de los frontends.