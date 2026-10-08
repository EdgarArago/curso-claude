# Revisión de inconsistencias: Backend (API) vs. Documentación

Fecha: 2026-08-19

---

## Alcance revisado

### Documentación

- `docs/arquitectura/arquitectura-api.md` (completo)
- `docs/dominio/modelo-datos.md` (completo)
- `docs/dominio/glosario.md` (completo)
- `docs/arquitectura/arquitectura-general.md` (partes de backend: stack, puertos, comandos, BD, autenticación)
- `README.md` (raíz, partes de backend: requisitos, setup, arranque, puertos, credenciales de seed)

### Código

- `packages/api/src/app.ts`, `src/server.ts`, `src/config/database.ts`
- `src/errors/AppError.ts`, `src/errors/DomainErrors.ts`
- `src/contexts/shared/infrastructure/http/errorHandler.ts`, `middlewares.ts`
- `src/contexts/shared/domain/value-objects/Email.ts`
- `src/contexts/employee/domain/**` (`Employee.ts`, `IEmployeeRepository.ts`, `IAuthService.ts`, `value-objects/Role.ts`)
- `src/contexts/employee/application/**` (`LoginUseCase.ts`, `CreateEmployeeUseCase.ts`, `RegisterClientUseCase.ts`, tests, mocks)
- `src/contexts/employee/infrastructure/**` (`SqliteEmployeeRepository.ts`, `BcryptAuthService.ts`, `http/*.routes.ts`, `AuthController.ts`, `EmployeeController.ts`, `dependencies.ts`)
- `src/routes/*.routes.ts` (restaurant, restaurant.public, dish, dish.public, ingredient, order)
- `src/controllers/*.controller.ts` (restaurant, dish, ingredient, order)
- `src/services/*.service.ts` (restaurant, dish, ingredient, order)
- `src/repositories/*.repository.ts` (restaurant, dish, ingredient, order) + `repositories/mocks/**`
- `src/models/*.model.ts` (restaurant, dish, ingredient, order)
- `src/scripts/seed.ts`
- `packages/api/package.json`, `package.json` (raíz), `packages/api/tsconfig.json`, `packages/api/vitest.config.ts`
- Todos los `*.test.ts` de `packages/api/src` (para contrastar las afirmaciones de la doc sobre cobertura de tests)

---

## Resumen ejecutivo

El backend está, en líneas generales, **muy alineado** con su documentación: rutas, verbos HTTP, roles por `authorize()`, nombres de campos, esquema SQL (columnas, tipos, nullability, PKs/FKs), alias de paths, arquitectura en dos estilos (hexagonal en `employee` / por capas en el resto), gestión de errores y scripts de arranque coinciden exactamente con el código en la inmensa mayoría de los puntos verificados. Se encontró **1 inconsistencia real**, de severidad **Media**, relacionada con una cascada de borrado documentada como garantía de base de datos que en realidad no estaba activa a nivel de SQLite; ya ha sido corregida (ver hallazgo 1). No se encontraron discrepancias de severidad Alta ni problemas de nombres/rutas/tipos mal documentados. Conteo: **Alta: 0 · Media: 1 (corregida) · Baja: 0**.

---

## Hallazgos

### 1. `ON DELETE CASCADE` documentado como garantía de BD, pero SQLite no la aplica (falta `PRAGMA foreign_keys = ON`)

- **Severidad**: Media
- **Estado**: Corregido — se añadió `PRAGMA foreign_keys = ON` en `Database.initialize()` (`packages/api/src/config/database.ts`), ejecutado tras abrir la conexión y antes de las migraciones. Verificado con la suite de tests (`npm run test -w @resttek/api`, 66/66 OK tras ajustar los fixtures de `ingredient.repository.test.ts` y `SqliteEmployeeRepository.test.ts`, que insertaban filas hijas sin la fila padre en `restaurants` y dependían de que la FK no se validara).
- **Ubicación en la documentación**:
  - `docs/dominio/modelo-datos.md:180-181` — tabla `dish_ingredients`, apartado Restricciones: *"FK a `dishes.id` **con** `ON DELETE CASCADE`: al borrar un plato desaparecen sus ingredientes asociados."*
  - `docs/dominio/modelo-datos.md:214` — tabla `order_items`, apartado Restricciones: *"ON DELETE CASCADE desde `orders.id`."*
- **Ubicación en el código**:
  - `packages/api/src/config/database.ts:138-165` — las sentencias `CREATE TABLE` declaran `FOREIGN KEY(dish_id) REFERENCES dishes(id) ON DELETE CASCADE` y `FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE`.
  - `packages/api/src/config/database.ts` (clase `Database` completa) — en ningún punto se ejecuta `PRAGMA foreign_keys = ON`. Verificado con `grep -rin "pragma" packages/api/src` → sin resultados.
  - `packages/api/src/repositories/dish.repository.ts:80-83` — `delete()` borra manualmente `dish_ingredients` antes de borrar `dishes` (`DELETE FROM dish_ingredients WHERE dish_id = ?` seguido de `DELETE FROM dishes WHERE id = ?`), en vez de confiar en la cascada de la BD.
- **Descripción**: SQLite (y el driver `sqlite3` de npm) **no aplica** las restricciones de clave foránea, incluido `ON DELETE CASCADE`, salvo que se ejecute `PRAGMA foreign_keys = ON` en la conexión. Como esa pragma nunca se ejecuta, las cláusulas `ON DELETE CASCADE` del esquema son inertes a nivel de motor. El comportamiento descrito para platos (*"al borrar un plato desaparecen sus ingredientes asociados"*) sí ocurre en la práctica, pero **no por la cascada de la BD**, sino porque `SqliteDishRepository.delete()` borra `dish_ingredients` manualmente en código de aplicación. Para `orders → order_items` la situación es más delicada: no existe ningún método `delete()` en `OrderRepository` ni ruta para borrar pedidos, así que la garantía "ON DELETE CASCADE desde `orders.id`" documentada no se ejerce nunca hoy, pero si en el futuro alguien borra un `order` por SQL directo o añade un endpoint de borrado sin replicar el borrado manual de `order_items`, quedarán filas huérfanas, contradiciendo lo que la documentación garantiza.
- **Sugerencia de corrección**: Corregir el código añadiendo `PRAGMA foreign_keys = ON` en `Database.initialize()` (recomendado, para que el esquema declarado sea realmente el comportamiento), o bien corregir la documentación indicando que el `ON DELETE CASCADE` está declarado en el esquema pero no forzado por SQLite, y que el borrado de `dish_ingredients` lo garantiza el código de `SqliteDishRepository`, no la BD.

---

## Áreas revisadas sin inconsistencias encontradas

Se comprobó explícitamente lo siguiente sin encontrar discrepancias entre documentación y código:

- **Endpoints y roles**: todas las rutas y verbos HTTP listados en `arquitectura-api.md` (`/health`, `/api/v1/auth/*`, `/api/v1/public/restaurants*`, `/api/v1/restaurants*`, `/api/v1/employees*`, `/api/v1/restaurants/:id/employees`, `/api/v1/restaurants/:id/dishes*`, `/api/v1/restaurants/:id/ingredients*`, `/api/v1/orders*`) coinciden exactamente con `app.ts` y los ficheros de `routes/`, incluidos los roles pasados a `authorize()`.
- **Esquema de datos**: todas las columnas, tipos, nullability, PKs y FKs de `modelo-datos.md` para `restaurants`, `employees`, `ingredients`, `dishes`, `dish_ingredients`, `orders`, `order_items` coinciden con `runInitialMigrations()` en `config/database.ts`.
- **Arquitectura dual (hexagonal DDD en `employee` / por capas en el resto)**: confirmada estructura de carpetas, prefijo `I` solo en `employee`, entidad única `Employee` con constructor privado + `create()`, únicos dos Value Objects (`Email`, `Role`), tres únicos casos de uso (`LoginUseCase`, `CreateEmployeeUseCase`, `RegisterClientUseCase`).
- **Normalización de enums**: `normalizeIngredientUnit`, `normalizeDishCategory`, `normalizeOrderStatus` y `PHONE_REGEX` están donde y como los describe la doc, con los mismos valores válidos.
- **Gestión de errores**: jerarquía `AppError`, lista de errores 404/401 en `errorHandler.ts`, y el comportamiento especial de `OrderController` (try/catch propio, `OrderNotFoundError` fuera de la lista de 404) coinciden exactamente con lo documentado.
- **JWT**: payload `{ id, role, restaurantId }`, expiración `8h`, `bcrypt` con 10 salt rounds — todo coincide.
- **Path aliases**: los 10 alias de `tsconfig.json` coinciden uno a uno con la tabla de la doc.
- **Scripts y puertos**: `npm run dev:api` → `tsx watch src/server.ts`, `npm run seed` → `tsx src/scripts/seed.ts`, `npm test` → `vitest run`, puerto por defecto `3000` (`server.ts`), ruta de BD `packages/api/resttek.db` fuera de test y `:memory:` con `NODE_ENV=test` — todo coincide con `arquitectura-general.md` y `README.md`.
- **Credenciales de seed**: la tabla de credenciales del `README.md` (admin, 2 gerentes, 2 cocineros, 3 camareros, 2 clientes, con sus `restaurantId` y contraseña = email) coincide exactamente con `scripts/seed.ts`, incluidos los IDs fijos `rest-1`/`rest-2`.
- **Tests**: confirmado que `supertest` figura como dependencia pero no se usa en ningún test (`grep` sin resultados), tal y como afirma `arquitectura-api.md`; confirmada la ubicación de los dobles (`contexts/employee/application/mocks/` y `repositories/mocks/`) y que no hay tests de integración HTTP.
- **Stack tecnológico**: Express 5 (`^5.2.1`), TypeScript, SQLite (`sqlite3`), ESM con extensiones `.js`, `tsx` como runtime — todo coincide con lo descrito en `arquitectura-api.md` y `arquitectura-general.md`.

No se han reportado hallazgos de severidad Baja por "no documentado" porque no se encontró ningún endpoint completo, modelo o regla de negocio significativa en el código que careciera de mención en la documentación.
