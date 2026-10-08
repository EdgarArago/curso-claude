# Inconsistencias Documentación vs. Código — Frontend (Resttek)

**Fecha:** 2026-08-19
**Autor de la revisión:** Agente de revisión (frontend)

---

## Alcance revisado

### Documentación

- `docs/arquitectura/arquitectura-frontend.md` (completo)
- `docs/arquitectura/arquitectura-general.md` (completo, con foco en las secciones que tocan el frontend: visión macro, scripts, puertos, separación de responsabilidades, relaciones entre paquetes)
- `README.md` (raíz del repo, completo)
- `packages/web-admin/README.md`
- `packages/web-clientes/README.md`
- `packages/web-empleados/README.md`
- `packages/web-shared/README.md` (no existe)

### Código

- `packages/web-admin/`: `src/app/app.routes.ts`, `app.config.ts`, `app.component.ts`, `core/layout/*`, `features/{dashboard,restaurants,dishes,ingredients,employees}/**` (routes, models, pages, services, store), `environments/*`, `package.json`, `angular.json`, `proxy.conf.json`
- `packages/web-empleados/`: `src/app/app.routes.ts`, `app.config.ts`, `app.component.ts`, `core/layout/*`, `features/orders/**` (pages cocina/barra/salon, models, services, store), `environments/*`, `package.json`, `angular.json`, `proxy.conf.json`
- `packages/web-clientes/`: `src/app/app.routes.ts`, `app.config.ts`, `app.ts`, `core/{layout,models,services,store}/*`, `features/{cart,menu,orders,restaurants}/*.component.ts`, `environments/*`, `package.json`, `angular.json`, `proxy.conf.json`
- `packages/web-shared/`: `src/index.ts`, `src/lib/tokens.ts`, `src/lib/auth/*`, `src/lib/http/*`, `src/lib/components/{login,register}/*`, `src/lib/styles/base.css`, `src/lib/assets/images/*`, `package.json`
- `package.json` raíz (workspaces y scripts)
- Verificación empírica: build real de `web-admin` con `ng build --configuration production` para comprobar la ruta de salida de `dist/`

---

## Resumen ejecutivo

La documentación de arquitectura frontend (`arquitectura-frontend.md` y `arquitectura-general.md`) es, en su mayor parte, muy precisa: puertos, proxy, estructura de carpetas, `web-shared`, interceptors, guard, duplicación del design system, uso desigual de `API_URL`, y las particularidades de `web-clientes` (componente `App`, rutas eager, sin wildcard) están todas verificadas y coinciden exactamente con el código. El hallazgo más relevante es que la sección "Gestión de Estado: el patrón Store" presenta el patrón Store + `firstValueFrom` como el más repetido y como la única forma en que los componentes hablan con los datos, pero en `web-clientes` ese patrón solo existe para el carrito (`CartStore`): todos los componentes que consumen restaurantes, platos y pedidos llaman a los servicios HTTP directamente con `.subscribe()`, sin store ni `firstValueFrom`. Además, `packages/web-clientes/README.md` es una plantilla genérica del Angular CLI sin editar, con datos incorrectos (puerto, tests con Vitest inexistentes). Conteo de hallazgos: **1 Alta, 2 Media, 2 Baja**. Estado tras revisión de seguimiento: Hallazgos 1, 2, 3 y 4 corregidos (el 1 corrigiendo la documentación, no el código: se decidió mantener `web-clientes` como está); Hallazgo 5 se deja tal cual (asimetría menor, no urgente).

---

## Hallazgos

### 1. El patrón Store (con `firstValueFrom`) no aplica a la mayoría de `web-clientes`

- **Severidad:** Alta
- **Estado:** Corregido — se decidió mantener el código de `web-clientes` tal cual (no todos los componentes pasan por un store) y corregir la documentación en su lugar. Se reescribió la sección "Gestión de Estado: el patrón Store" de `arquitectura-frontend.md` para dejar claro que el patrón es el estándar en `web-admin`/`web-empleados`, pero que en `web-clientes` solo lo sigue `CartStore` (local, sin HTTP); el resto de componentes (`restaurant-list`, `restaurant-menu`, `cart` al confirmar, `my-orders`, `order-detail`) consumen los servicios HTTP directamente con `.subscribe()`.
- **Ubicación en la documentación:**
  - `docs/arquitectura/arquitectura-frontend.md:70-72`: *"Es el patrón más repetido del frontend. Cada store es un servicio `providedIn: 'root'`..."*
  - `docs/arquitectura/arquitectura-frontend.md:103`: *"El store consume el service (que devuelve `Observable`) y lo convierte con `firstValueFrom`. Los componentes solo hablan con el store."*
  - `docs/arquitectura/arquitectura-frontend.md:16` (tabla de stack): *"RxJS | Solo para HTTP, y casi siempre envuelto en `firstValueFrom`"*
  - La sección "Casos particulares" (líneas 107-110) solo menciona dos matices (`OrderStore` con polling, `CartStore` sin HTTP), dando a entender que el resto de stores de `web-clientes` siguen el patrón estándar.
- **Ubicación en el código:**
  - `packages/web-clientes/src/app/features/restaurants/restaurant-list.component.ts:101,112` — inyecta `RestaurantService` directamente y llama `.subscribe({...})`.
  - `packages/web-clientes/src/app/features/menu/restaurant-menu.component.ts:211-254` — inyecta `DishService`/`RestaurantService` y llama `.subscribe({...})` dos veces en `loadData()`.
  - `packages/web-clientes/src/app/features/cart/cart.component.ts:173,210` — inyecta `OrderService` y llama `.subscribe({...})` en `confirmOrder()`.
  - `packages/web-clientes/src/app/features/orders/my-orders.component.ts:123,143` — inyecta `OrderService` y llama `.subscribe({...})`.
  - `packages/web-clientes/src/app/features/orders/order-detail.component.ts:199` — mismo patrón (`.subscribe({...})`).
  - Solo existe `CartStore` en `packages/web-clientes/src/app/core/store/cart.store.ts`, que además es puramente local (sin HTTP), tal como el propio doc indica.
- **Descripción:** La documentación presenta el patrón Store + `firstValueFrom` como la norma general del frontend ("el patrón más repetido", "los componentes solo hablan con el store"), pero en `web-clientes` no existe ningún `RestaurantStore`, `DishStore` ni `OrderStore`: los cinco componentes de features (`restaurants`, `menu`, `cart`, `orders`) inyectan los servicios HTTP directamente y usan `.subscribe()` con callbacks `next`/`error`, sin pasar por un store ni por `firstValueFrom`. Solo `web-admin` y `web-empleados` (y el `CartStore` de `web-clientes`) siguen el patrón documentado.
- **Sugerencia de corrección:** Corregir el doc. Aclarar que el patrón Store + `firstValueFrom` es el estándar en `web-admin` y `web-empleados`, pero que en `web-clientes` solo se usa para el carrito (`CartStore`, sin HTTP); el resto de datos (restaurantes, platos, pedidos) se consume llamando a los servicios directamente desde los componentes con `.subscribe()`. La frase "los componentes solo hablan con el store" debería matizarse como válida solo para las apps que usan el patrón.

---

### 2. `packages/web-clientes/README.md` es la plantilla genérica del Angular CLI, con datos incorrectos

- **Severidad:** Media
- **Estado:** Corregido — se reescribió `packages/web-clientes/README.md` siguiendo el formato de `web-admin`/`web-empleados` (puerto 4202, `npm start`, funcionalidades reales, estructura de carpetas, ruta de build correcta); se eliminó la sección de tests con Vitest, inexistente en este paquete.
- **Ubicación en la documentación:**
  - `packages/web-clientes/README.md:13-17`: *"Once the server is running, open your browser and navigate to `http://localhost:4200/`"*
  - `packages/web-clientes/README.md:33-37`: *"To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command: `ng test`"*
- **Ubicación en el código:**
  - `packages/web-clientes/angular.json:63` — `"port": 4202` en la configuración de `serve` (coincide con `README.md` raíz y `arquitectura-general.md:12`, que documentan `web-clientes` en el puerto **4202**, no 4200).
  - `packages/web-clientes/package.json` — no existe script `"test"`, ni dependencia de `vitest`, ni ficheros `*.spec.ts`/`*.test.ts` en `packages/web-clientes/src/`.
- **Descripción:** A diferencia de `web-admin/README.md` y `web-empleados/README.md` (que sí fueron editados para describir la app real), el README de `web-clientes` es el texto por defecto generado por `ng new`, sin adaptar. Contiene dos afirmaciones verificablemente falsas para este proyecto: (1) el puerto por defecto de `ng serve` sería 4200, cuando `angular.json` lo fija en 4202; (2) que hay tests unitarios configurados con Vitest ejecutables vía `ng test`, cuando no existe ni el script ni la dependencia ni ningún fichero de test en el paquete. Además, no menciona `@resttek/web-shared`, el proxy, las rutas ni las funcionalidades de la app (a diferencia de los otros dos README de paquete).
- **Sugerencia de corrección:** Corregir el código de documentación: reescribir `packages/web-clientes/README.md` siguiendo el formato de `web-admin/README.md` / `web-empleados/README.md` (puerto 4202, comando `npm start`, descripción real de funcionalidades: listado de restaurantes, carta, carrito, pedidos), y eliminar la sección de tests o dejarla en blanco hasta que existan.

---

### 3. Polling no documentado en `web-clientes` (`MyOrdersComponent`, cada 10 s)

- **Severidad:** Media
- **Estado:** Corregido — se amplió la sección "Casos particulares" de `docs/arquitectura/arquitectura-frontend.md` para mencionar el polling de 10 s de `MyOrdersComponent`.
- **Ubicación en la documentación:**
  - `docs/arquitectura/arquitectura-frontend.md:107-109`: *"Casos particulares: `OrderStore` (web-empleados) añade **polling cada 30 s** con `startPolling()` / `stopPolling()`, ya que la API no tiene websockets."* — presentado como el único caso de polling del frontend.
- **Ubicación en el código:**
  - `packages/web-clientes/src/app/features/orders/my-orders.component.ts:124,132,136-138` — `ngOnInit` llama `setInterval(() => this.loadOrders(false), 10000)` y `ngOnDestroy` lo limpia con `clearInterval`.
- **Descripción:** Existe un segundo mecanismo de polling en el frontend, en `web-clientes`, que refresca "Mis Pedidos" cada 10 segundos (no 30), implementado directamente en el componente con `setInterval`/`clearInterval` (no en un store, ya que como se indica en el Hallazgo 1 no existe `OrderStore` en `web-clientes`). El documento da a entender que el `OrderStore` de `web-empleados` es el único caso de polling del frontend.
- **Sugerencia de corrección:** Ampliar la sección "Casos particulares" del doc para mencionar también el polling de `MyOrdersComponent` en `web-clientes` (10 s, implementado en el propio componente).

---

### 4. Ruta de salida de `dist/` documentada de forma incompleta

- **Severidad:** Baja
- **Estado:** Corregido — `packages/web-admin/README.md` y `packages/web-empleados/README.md` ahora indican `dist/<app>/browser/`.
- **Ubicación en la documentación:**
  - `packages/web-admin/README.md` (sección "Build"): *"Los archivos generados estarán en `dist/web-admin/`"*
  - `packages/web-empleados/README.md` (sección "Build"): *"Los archivos generados estarán en `dist/web-empleados/`"*
- **Ubicación en el código:**
  - `packages/web-admin/angular.json` (`architect.build.options`, sin `outputPath` explícito, `builder: "@angular/build:application"`) — con el builder de aplicación de Angular 21 sin `outputPath` personalizado, la salida real es `dist/web-admin/browser/`.
  - Verificado ejecutando `ng build --configuration production` en `packages/web-admin`: el resultado fue `dist/web-admin/browser/` (con `index.html` y los bundles JS/CSS ahí), mientras que `dist/web-admin/` en sí solo contiene `prerendered-routes.json`, `3rdpartylicenses.txt` y la subcarpeta `browser/`.
- **Descripción:** Los ficheros estáticos desplegables (los que se sirven realmente) están en `dist/<app>/browser/`, no directamente en `dist/<app>/`. La afirmación del README no es del todo errónea (esos archivos sí están *dentro* de `dist/web-admin/`), pero es imprecisa y puede llevar a apuntar un servidor estático a la carpeta equivocada.
- **Sugerencia de corrección:** Corregir ambos README de paquete a `dist/web-admin/browser/` y `dist/web-empleados/browser/` respectivamente.

---

### 5. `web-shared` no tiene `README.md`

- **Severidad:** Baja (no documentado, no contradicción)
- **Ubicación en la documentación:** N/A — ni `arquitectura-frontend.md` ni `arquitectura-general.md` prometen un README para `web-shared`.
- **Ubicación en el código:** `packages/web-shared/` no contiene `README.md` (los otros tres paquetes sí).
- **Descripción:** No es una inconsistencia respecto a ninguna afirmación de la documentación, solo una asimetría entre paquetes que vale la pena señalar dado que es el único paquete Angular sin README propio.
- **Sugerencia de corrección:** Opcional — añadir un README breve a `web-shared` si se quiere mantener la simetría con los otros paquetes. No es urgente.

---

## Áreas revisadas sin inconsistencias encontradas

Para dejar constancia explícita de lo verificado y descartado como correcto:

- **Puertos y proxy**: 4200 (web-admin), 4201 (web-empleados), 4202 (web-clientes) coinciden exactamente entre `README.md` raíz, `arquitectura-general.md` y los tres `angular.json`. Los tres `proxy.conf.json` son idénticos y apuntan a `http://localhost:3000`, tal como documenta `arquitectura-general.md` y `arquitectura-frontend.md`.
- **Scripts npm raíz**: `dev:api`, `dev:admin`, `dev:empleados`, `dev:clientes`, `test`, `seed` en `package.json` raíz coinciden exactamente con la tabla de `arquitectura-general.md`.
- **`API_URL` y `environment.apiUrl`**: los tres `environment.ts` (y `environment.production.ts` de web-admin/web-empleados) usan `'/api/v1'`, como documenta el doc. La afirmación de "uso desigual" (los servicios de `web-clientes` inyectan `API_URL`; los de `web-admin`/`web-empleados` importan `environment.apiUrl` directamente) se verificó línea por línea en los servicios de las tres apps y es exacta.
- **Zoneless**: `web-admin` y `web-empleados` llaman `provideZonelessChangeDetection()` explícitamente en `app.config.ts`; `web-clientes` no. Ningún `angular.json` declara `polyfills` con `zone.js`. Coincide con el doc.
- **Estructura de carpetas**: la estructura documentada para `web-admin`/`web-empleados` (`core/layout`, `features/<feature>/{routes,models,pages,services,store}`) y para `web-clientes` (`core/{layout,models,services,store}` + `features/` como componentes sueltos) coincide exactamente con el árbol de ficheros real, incluidos los nombres de fichero citados textualmente en el doc (`cart.store.ts`, `restaurant-menu.component.ts`, `my-orders.component.ts`, `order-detail.component.ts`, `restaurant-list.component.ts`, `shell.component.ts`).
- **Componente raíz**: `web-clientes` usa `export class App {}` en `app.ts` (no `AppComponent`); `web-admin` y `web-empleados` usan `AppComponent` en `app.component.ts`. Coincide con el doc.
- **`web-shared`**: estructura (`tokens.ts`, `auth/*`, `http/*`, `components/{login,register}/*`, `assets/images/`, `styles/base.css`) y exports de `index.ts` coinciden literalmente, línea por línea, con lo documentado. `package.json` de `web-shared` apunta `main` a `src/index.ts` sin paso de build, como se documenta.
- **Duplicación del design system**: verificado con `diff` que `web-admin/src/styles.css` y `web-clientes/src/styles.css` son copias idénticas de `web-shared/src/lib/styles/base.css`, y que `web-empleados/src/styles.css` añade exactamente 46 líneas propias (264 → 310 líneas). Confirmado también que ningún fichero del repo importa `base.css` ni se exporta desde `index.ts` de `web-shared`. La cita textual del doc ("copia con 46 líneas propias añadidas") es exacta.
- **AuthStore, AuthService, AuthGuard, interceptors**: firmas, comportamiento y ubicación coinciden con los fragmentos de código citados en el doc (el interceptor de error real tiene más lógica de la mostrada en el snippet simplificado del doc, pero el doc no pretende ser código literal y la descripción funcional —"intercepta 401 y redirige al login"— es correcta).
- **Routing y lazy loading**: confirmado que `web-clientes` carga `LoginComponent`/`RegisterComponent` de forma eager con `component:` y no define ruta `**`; que `web-empleados` carga su `ShellComponent` de forma eager (`component: ShellComponent`) mientras el resto de rutas usa `loadComponent`/`loadChildren`; que `web-admin` sí tiene ruta `**` con `NotFoundComponent`.
- **Filtrado por rol en `web-empleados`**: el `ShellComponent` real reproduce exactamente `canSeeCocina`, `canSeeBarra`, `canSeeSalon` y `defaultRoute` citados en el doc, incluido el uso del rol `'manager'` (no `'gerente'`) y su uso en la plantilla (`shell.component.html`) para ocultar/mostrar enlaces del menú.
- **`app.config.ts` / iconos Lucide**: los tres `app.config.ts` usan `LucideAngularModule.pick()` con listas de iconos distintas por app, como documenta el doc.
- **Assets compartidos**: los tres `angular.json` incluyen `{ "glob": "**/*", "input": "../web-shared/src/lib/assets", "output": "/assets" }`, confirmando la copia de imágenes de `web-shared` al build de cada app.
- **`web-admin/README.md`**: funcionalidades (Dashboard, Restaurantes, Platos con categorías `entrante/principal/postre/bebida`, Ingredientes, Empleados con roles `manager/camarero/cocinero`) y estructura de carpetas descritas coinciden exactamente con `app.routes.ts`, los `*.routes.ts` de cada feature y los modelos/formularios reales.
- **`web-empleados/README.md`**: tabla de estados (`pendiente/preparando/listo/entregado`), roles y permisos (Camarero → Barra/Salón, Cocinero → Cocina, Gerente → todo), auto-refresh de 30 s, y la tabla de endpoints (`GET /api/v1/orders/active?restaurantId=`, `PATCH /api/v1/orders/:orderId/items/:itemId/status`) coinciden exactamente con `order.service.ts`, `order.store.ts` y los componentes `cocina`/`barra`/`salon`.
- **CartStore**: confirmado que es puramente local (sin `HttpClient` inyectado) y que `addItem()` vacía el carrito (`this._items.set([])`) cuando el plato añadido pertenece a otro restaurante, tal como documenta el doc.
- **Versión de Angular y stack**: Angular ^21.1.0/^21.2.0 en los `package.json` de las tres apps (21.2.7 instalado), standalone components (sin `NgModule` de aplicación) y signals en uso consistente con el doc.

---

## Nota sobre metodología

Para el Hallazgo 4 se ejecutó un build real (`ng build --configuration production`) en `packages/web-admin` para verificar empíricamente la ruta de salida; el directorio `dist/` generado se eliminó tras la comprobación para no dejar artefactos de build en el repositorio.
