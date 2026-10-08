# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Resttek: plataforma de gestión de restaurantes. Monorepo con **npm workspaces** (`packages/*`): una API Express 5 + TypeScript + SQLite y tres apps Angular 21 que comparten la librería `@resttek/web-shared`. La documentación detallada (en español) está en `docs/` — `docs/arquitectura/arquitectura-api.md` y `arquitectura-frontend.md` son la referencia principal; `docs/dominio/` tiene glosario y modelo de datos.

## Comandos

Desde la raíz (Node 22+, npm 10+):

```bash
npm install              # instala y enlaza todos los workspaces
npm run seed             # datos de prueba (idempotente, INSERT OR IGNORE)
npm run dev:api          # API en :3000 (tsx watch); healthcheck: GET /health
npm run dev:admin        # web-admin     → :4200
npm run dev:empleados    # web-empleados → :4201
npm run dev:clientes     # web-clientes  → :4202
npm test                 # vitest run (solo existen tests en la API)
```

- Un solo fichero de test: `cd packages/api && npx vitest run src/services/order.service.test.ts`
- Un test por nombre: `cd packages/api && npx vitest run -t "nombre del test"`
- Modo watch: `cd packages/api && npm run test:watch`
- Build de un frontend: `npm run build -w @resttek/web-admin` (igual para `web-empleados` / `web-clientes`)
- No hay linter configurado. Solo `web-clientes` tiene `.prettierrc`.

Credenciales tras el seed: **la contraseña de cada usuario es su propio email** (p. ej. `admin@resttek.com`, `gerente1@resttek.com`, `cocinero1@resttek.com`, `camarero1@resttek.com`, `cliente1@resttek.com`). Lista completa en el README.

## Arquitectura de la API (`packages/api`)

Conviven **dos estilos**; identifica cuál aplica antes de tocar código:

- **Hexagonal + DDD, solo en `employee`** (`src/contexts/employee/{domain,application,infrastructure}`). `Employee` es la única entidad de dominio (constructor privado + `Employee.create()` que valida; getters sin setters). Value objects: `Email` (en `contexts/shared`) y `Role`. Casos de uso con un único `execute()` e inyección por constructor. Interfaces con prefijo `I` (`IEmployeeRepository`, `IAuthService`). El cableado de dependencias está en `infrastructure/http/dependencies.ts`.
- **Por capas en `restaurant`, `dish`, `ingredient`, `order`**: `src/models/` (interfaces planas + funciones `normalizeX()` que hacen trim/lowercase y lanzan error de dominio), `repositories/` (interfaz sin prefijo `I` + `Sqlite*Repository` en el mismo fichero), `services/` (lógica y validación, varios métodos por servicio), `controllers/`, `routes/`. La composición de dependencias se hace **en el propio fichero de rutas**.

Detalles que no son obvios:

- Los clientes **son `Employee`** con `role = 'cliente'` y `restaurantId = null`; no hay tabla de clientes. El rol de gerente se almacena como `'manager'`, no `'gerente'`.
- Al crear un pedido, un ítem con `quantity: N` se expande en N filas de `order_items` con `quantity: 1` (para seguir el estado de cada unidad).
- Routers montados bajo `/restaurants/:restaurantId/...` necesitan `Router({ mergeParams: true })`.
- Auth: `authenticate` (JWT Bearer → `req.user`, 401) y `authorize(roles)` (403) en `contexts/shared/infrastructure/http/middlewares.ts`. Las rutas de pedidos no usan `authorize()`.
- Errores: `AppError` → errores en `errors/DomainErrors.ts`. El `errorHandler` asigna el código HTTP **por nombre de clase** (lista explícita de 404, `InvalidCredentialsError` → 401, resto de `AppError` → 400). Un error nuevo de "no encontrado" debe añadirse a esa lista. `OrderController` es la excepción: hace su propio try/catch en vez de `next(error)`.
- `save()` en los repositorios decide UPDATE vs INSERT; el mapeo snake_case → camelCase se hace con alias en el SQL.
- ESM (`"type": "module"`, `module: nodenext`): los imports locales llevan extensión `.js`. Path aliases en `tsconfig.json` (`@config/*`, `@errors/*`, `@shared/*`, `@employee/*`, `@models/*`, `@repositories/*`, `@services/*`, `@controllers/*`, `@routes/*`), resueltos por `tsx` y `vite-tsconfig-paths` en tests.
- BD: `dbConfig` (instancia exportada de `Database` en `config/database.ts`) con API de promesas `run/all/get`. Tablas creadas en `initialize()` con `CREATE TABLE IF NOT EXISTS`. Fichero `packages/api/resttek.db`, o `:memory:` con `NODE_ENV=test`.
- Env: `PORT` (3000), `JWT_SECRET` (con valor por defecto en código).
- Tests unitarios junto al código (`*.test.ts`); dobles en `contexts/employee/application/mocks/` y `repositories/mocks/`. No hay tests HTTP (supertest instalado pero sin usar).

## Arquitectura de los frontends

Angular 21: standalone components, signals, zoneless (no hay `zone.js`), guards/interceptors funcionales, iconos Lucide (cada `app.config.ts` registra sus iconos con `LucideAngularModule.pick()` — un icono nuevo hay que añadirlo ahí).

- **`web-admin` / `web-empleados`**: `features/<feature>/{models,pages,services,store}`. Patrón Store: servicio `providedIn: 'root'` con signals privadas expuestas `asReadonly()`, trío `loading`/`error`/datos, el service HTTP se consume con `firstValueFrom`, y los componentes solo hablan con el store. Tras crear/actualizar se usa `.update()` en memoria en lugar de recargar. `OrderStore` de empleados hace polling cada 30 s. Los servicios usan `environment.apiUrl` directamente.
- **`web-clientes`**: estructura distinta — modelos y servicios centralizados en `core/`, componente raíz `App` en `app.ts`. Solo hay un store (`CartStore`, local); el resto de componentes llaman a los servicios con `.subscribe()` y hacen su propio polling con `setInterval`. Los servicios inyectan el token `API_URL`.
- En `web-empleados` el filtrado por rol (cocina/barra/salón) es solo de navegación, vía `computed()` en `ShellComponent`; la autorización real es la de la API.
- Todas las apps hacen proxy de `/api` → `http://localhost:3000` (`proxy.conf.json`); `apiUrl` es `'/api/v1'`.

**`@resttek/web-shared`** (auth store/service/guard, interceptors de token y de 401 → `/login`, componentes login/register, token `API_URL`): se consume desde el fuente (`main: src/index.ts`, sin build). Los exports nuevos van en `src/index.ts`. Tras cambiar `web-shared` hay que reiniciar el dev server del frontend.

**Design system duplicado**: `web-shared/src/lib/styles/base.css` no lo importa nadie. Cada app tiene su propia copia en `src/styles.css` (`web-empleados` con añadidos propios). Un cambio de estilo común hay que replicarlo en las tres apps.

## Otros

`scripts/seed-issues.sh` crea issues de GitHub desde `scripts/issues.json` con `gh` + `jq` (usar `--dry-run` primero). `docs/revisiones/` recoge revisiones de inconsistencias entre docs y código; si cambias comportamiento documentado, actualiza `docs/`.
