# Resttek

Plataforma de gestión de restaurantes: panel de administración, app para empleados (cocina, barra y salón) y app de pedidos para clientes, sobre una API Node.js.

Esta guía te lleva desde cero hasta tener el entorno funcionando y entender el flujo básico de la aplicación. Para el detalle de arquitectura y dominio, consulta [`docs/`](./docs).

---

## Requisitos Previos

| Herramienta | Versión mínima | Verificar |
| --- | --- | --- |
| **Node.js** | 22+ | `node --version` |
| **npm** | 10+ | `npm --version` |
| **Git** | 2.40+ | `git --version` |

---

## Setup Inicial

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd <nombre-repositorio>
```

### 2. Instalar dependencias de Node.js

El monorepo usa **npm workspaces**, así que un solo `install` desde la raíz instala todo:

```bash
npm install
```

Esto instala las dependencias de todos los paquetes: `api`, `web-admin`, `web-clientes`, `web-empleados` y `web-shared`.

### 3. Poblar la base de datos

La API usa SQLite. Las tablas se crean automáticamente al iniciar el servidor, pero necesitas datos de prueba:

```bash
npm run seed
```

Este comando ejecuta el script `packages/api/src/scripts/seed.ts`, que crea restaurantes, empleados, ingredientes, platos y pedidos de ejemplo.

---

## Arrancar el Entorno de Desarrollo

### API

```bash
# API Node.js (Express + TypeScript)
npm run dev:api
```

La API arranca en `http://localhost:3000`. Puedes verificar con:

```bash
curl http://localhost:3000/health
# → {"status":"ok"}
```

### Frontends

Cada frontend se arranca de forma independiente. Todos hacen proxy de `/api` hacia `http://localhost:3000`:

```bash
# Terminal 2: Panel de Administración
npm run dev:admin       # → http://localhost:4200

# Terminal 3: App de Empleados
npm run dev:empleados   # → http://localhost:4201

# Terminal 4: App de Clientes
npm run dev:clientes    # → http://localhost:4202
```

---

## Puertos y Servicios

| Servicio | Puerto | URL |
| --- | --- | --- |
| API | 3000 | http://localhost:3000 |
| Web Admin | 4200 | http://localhost:4200 |
| Web Empleados | 4201 | http://localhost:4201 |
| Web Clientes | 4202 | http://localhost:4202 |

---

## Credenciales de Prueba

Tras ejecutar `npm run seed`, estas credenciales están disponibles. **La contraseña de cada usuario es su propio email.**

| Rol | Email (= contraseña) | Restaurante | Acceso |
| --- | --- | --- | --- |
| **Admin** | `admin@resttek.com` | — | web-admin |
| **Gerente** (`manager`) | `gerente1@resttek.com` | rest-1 | web-admin, web-empleados |
| **Gerente** (`manager`) | `gerente2@resttek.com` | rest-2 | web-admin, web-empleados |
| **Cocinero** | `cocinero1@resttek.com` | rest-1 | web-empleados (cocina) |
| **Cocinero** | `cocinero2@resttek.com` | rest-2 | web-empleados (cocina) |
| **Camarero** | `camarero1@resttek.com` | rest-1 | web-empleados (barra, salón) |
| **Camarero** | `camarero2@resttek.com` | rest-1 | web-empleados (barra, salón) |
| **Camarero** | `camarero3@resttek.com` | rest-2 | web-empleados (barra, salón) |
| **Cliente** | `cliente1@resttek.com` | — | web-clientes |
| **Cliente** | `cliente2@resttek.com` | — | web-clientes |

Por ejemplo, para entrar como admin: usuario `admin@resttek.com`, contraseña `admin@resttek.com`.

`seed` usa `INSERT OR IGNORE`, así que puedes ejecutarlo varias veces sin duplicar los datos de prueba. Al terminar imprime la lista completa de credenciales por consola.

---

## Primer Recorrido (Happy Path)

### Como Administrador

1. Accede a `http://localhost:4200`
2. Inicia sesión con las credenciales de admin
3. Navega al **Dashboard** → verás el listado de restaurantes
4. Entra en un restaurante → explora **Platos**, **Ingredientes**, **Empleados**
5. Prueba a crear un nuevo plato con ingredientes

### Como Cliente

1. Accede a `http://localhost:4202`
2. Regístrate con una cuenta nueva o usa las credenciales de cliente
3. Navega los restaurantes disponibles
4. Entra en un restaurante → ve la carta
5. Añade platos al carrito y realiza un pedido
6. Consulta el estado en **Mis Pedidos**

### Como Empleado

1. Accede a `http://localhost:4201`
2. Inicia sesión como cocinero → accedes a la vista de **Cocina**
3. Verás los pedidos pendientes → marca un ítem como "Preparando" → "Listo"
4. Inicia sesión como camarero → accedes a **Barra** y **Salón**
5. En Salón, entrega los ítems que están listos

---

## Estructura de Desarrollo Día a Día

```
Terminal 1: npm run dev:api          (deja corriendo)
Terminal 2: npm run dev:admin        (o el frontend que necesites)
Terminal 3: (libre para git, tests, etc.)
```

### Tests

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch (desarrollo activo)
cd packages/api && npm run test:watch
```

---

## Problemas Comunes

### "Database is not initialized"

La API no se ha arrancado correctamente. Verifica que el puerto 3000 no esté ocupado:

```bash
lsof -i :3000
```

### "Cannot find module @resttek/web-shared"

Ejecuta `npm install` desde la raíz del monorepo. Los workspaces necesitan estar linkeados.

### Los cambios en web-shared no se reflejan

Angular no detecta cambios en librerías externas al workspace automáticamente. Reinicia el servidor de desarrollo del frontend.

### Error de CORS

Asegúrate de acceder al frontend por el proxy (puerto del frontend, no directamente al 3000). La API tiene CORS habilitado, pero el proxy es la forma recomendada.