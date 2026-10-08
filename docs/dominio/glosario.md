# Glosario

Terminología del dominio y conceptos técnicos utilizados en el proyecto Resttek.

---

## Términos del Dominio

### Entidades de Negocio

| Término | Definición |
| --- | --- |
| **Restaurant** | Establecimiento de hostelería gestionado por el sistema. Tiene nombre, dirección, email, teléfono, propietario y logo. |
| **Employee** | Persona que trabaja en el sistema. Tiene un rol y puede estar asignada a un restaurante. |
| **Dish** | Plato de la carta de un restaurante. Tiene nombre, descripción, precio, categoría y puede estar disponible o no. |
| **Ingredient** | Ingrediente utilizado en los platos. Tiene nombre, unidad de medida y stock actual. Pertenece a un restaurante. |
| **DishIngredient** | Relación entre un plato y un ingrediente, con la cantidad necesaria. |
| **Order** | Pedido realizado por un cliente. Contiene ítems (platos) y está asociado a un restaurante. |
| **OrderItem** | Línea de un pedido: un plato con cantidad, notas opcionales y estado. |

Dos particularidades del modelo que conviene tener presentes:

- **Los clientes son `Employee`.** No hay entidad ni tabla de clientes: un cliente es una fila de `employees` con `role = 'cliente'` y `restaurant_id = null`. Por eso el login es el mismo endpoint para todos y la respuesta se llama `employee` incluso al registrarse como cliente.
- **Cada unidad pedida es un `OrderItem`.** Al crear un pedido con 3 unidades de un plato se generan 3 filas con `quantity: 1`, para que cocina pueda marcar el estado de cada una por separado.

### Roles

| Rol | Descripción | Acceso |
| --- | --- | --- |
| **admin** | Administrador del sistema. Gestiona restaurantes, empleados y configuración. | web-admin |
| **manager** | Gerente de restaurante. Gestiona los platos de su restaurante. | web-admin, web-empleados (todas las vistas) |
| **cocinero** | Cocinero del restaurante. Prepara los pedidos. | web-empleados (cocina) |
| **camarero** | Camarero del restaurante. Atiende barra y salón. | web-empleados (barra, salón) |
| **cliente** | Cliente final. Hace pedidos. | web-clientes |

El valor almacenado es `manager`; "gerente" es solo su traducción en la interfaz. La columna **Acceso** describe lo que muestra el menú de cada app, no una restricción real: en `web-empleados` el filtrado por rol es de navegación y las tres vistas son accesibles por URL para cualquier usuario con sesión. Quien decide de verdad es el middleware `authorize()` de la API.

### Estados de Pedido

| Estado | Descripción | Quién lo cambia |
| --- | --- | --- |
| **pendiente** | Ítem recién pedido, sin procesar. | — (estado inicial) |
| **preparando** | Ítem siendo preparado en cocina. | cocinero |
| **listo** | Ítem preparado, listo para servir. | cocinero |
| **entregado** | Ítem entregado al cliente. Desaparece de las vistas activas. | camarero |

### Categorías de Platos

| Categoría | Descripción |
| --- | --- |
| **entrante** | Primeros platos, aperitivos |
| **principal** | Platos principales |
| **postre** | Postres |
| **bebida** | Bebidas |

### Unidades de Ingredientes

| Unidad | Descripción |
| --- | --- |
| **kg** | Kilogramos |
| **g** | Gramos |
| **l** | Litros |
| **ml** | Mililitros |
| **unidad** | Unidades sueltas |

Son los únicos valores que acepta `normalizeIngredientUnit()`. La entrada se normaliza con `trim()` + `toLowerCase()`, así que `KG` es válido, pero abreviaturas como `ud` o `L.` se rechazan con `InvalidUnitError`.

---

## Conceptos Técnicos

### Arquitectura

| Concepto | Definición |
| --- | --- |
| **Monorepo** | Repositorio único que contiene múltiples paquetes/proyectos relacionados. |
| **npm Workspaces** | Funcionalidad de npm para gestionar múltiples paquetes en un monorepo. |
| **Arquitectura Hexagonal** | Patrón arquitectónico que separa el dominio de la infraestructura mediante puertos (interfaces) y adaptadores (implementaciones). |
| **DDD (Domain-Driven Design)** | Enfoque de diseño que organiza el código alrededor de los dominios de negocio. |
| **Bounded Context** | Límite conceptual dentro del cual un modelo de dominio es consistente. En Resttek solo **Employee** está implementado así (`src/contexts/employee/`); el resto de dominios usan una organización por capas. |

### Capas de la API

Las tres capas aplican al contexto `employee`:

| Capa | Responsabilidad |
| --- | --- |
| **Domain** | Entidades, value objects, interfaces de repositorio. Reglas de negocio puras. |
| **Application** | Casos de uso. Orquesta la lógica de negocio. |
| **Infrastructure** | Implementaciones concretas: BD, HTTP, servicios externos. |

En `restaurant`, `dish`, `ingredient` y `order` la separación equivalente es por carpetas: `models/`, `repositories/`, `services/`, `controllers/` y `routes/`.

### Patrones

| Patrón | Descripción | Ejemplo en Resttek |
| --- | --- | --- |
| **Entity** | Objeto con identidad única y comportamiento propio. | `Employee` (la única). `Restaurant`, `Dish`, `Ingredient` y `Order` son `interface` planas |
| **Value Object** | Objeto inmutable definido por su valor. | `Email`, `Role` |
| **Repository** | Abstracción de persistencia. | `IEmployeeRepository`, `RestaurantRepository` |
| **Use Case** | Acción de negocio específica, una clase con `execute()`. | `LoginUseCase`, `CreateEmployeeUseCase`, `RegisterClientUseCase` |
| **Service** | Equivalente al caso de uso fuera de `employee`: una clase con varios métodos. | `RestaurantService`, `DishService`, `OrderService` |
| **DTO** | Objeto para transferir datos entre capas. | `CreateRestaurantDTO`, `LoginDTO` |
| **Factory Method** | Método estático para crear instancias con validación. | `Employee.create()` |
| **Store** | Servicio Angular que guarda estado con signals. | `AuthStore`, `DishStore`, `CartStore` |

### Frontend

| Concepto | Definición |
| --- | --- |
| **Standalone Component** | Componente Angular que no necesita NgModule. |
| **Signal** | Primitiva reactiva de Angular para estado. |
| **Zoneless** | Modo de Angular sin zone.js, usando signals para change detection. |
| **Functional Guard** | Función que protege rutas (reemplaza a clases con CanActivate). |
| **Functional Interceptor** | Función que intercepta peticiones HTTP. |
| **Lazy Loading** | Carga de componentes/módulos bajo demanda al navegar. |
| **Barrel Export** | Archivo `index.ts` que re-exporta para simplificar imports. |

### Autenticación

| Concepto | Definición |
| --- | --- |
| **JWT** | JSON Web Token. Token firmado que contiene `id`, `role` y `restaurantId`. Caduca a las **8 h**. |
| **Bearer Token** | Esquema de autenticación: `Authorization: Bearer <jwt>`. |
| **bcrypt** | Algoritmo de hash para contraseñas (10 salt rounds). |
| **AuthGuard** | Guard que verifica si hay sesión activa antes de permitir acceso a una ruta. No comprueba roles. |
| **AuthInterceptor** | Interceptor que añade el token JWT a cada petición HTTP. |
| **ErrorInterceptor** | Interceptor que ante un 401 limpia la sesión y redirige a `/login`. |