import { randomUUID } from 'crypto'
import { dbConfig } from '@config/database.js'
import { BcryptAuthService } from '@employee/infrastructure/BcryptAuthService.js'
import { SqliteEmployeeRepository } from '@employee/infrastructure/SqliteEmployeeRepository.js'
import { Employee } from '@employee/domain/Employee.js'

const seed = async () => {
    try {
        await dbConfig.initialize()
        console.log('Database initialized.')

        const authService = new BcryptAuthService()
        const employeeRepo = new SqliteEmployeeRepository(dbConfig)

        const admin = await employeeRepo.findByEmail('admin@resttek.com')
        if (!admin) {
            const adminEmployee = Employee.create({
                id: randomUUID(),
                firstName: 'Admin',
                lastName: 'RestTek',
                email: 'admin@resttek.com',
                passwordHash: await authService.hashPassword('admin@resttek.com'),
                role: 'admin',
                restaurantId: null
            })
            await employeeRepo.save(adminEmployee)
            console.log('Admin created: admin@resttek.com / admin@resttek.com')
        } else {
            console.log('Admin already exists.')
        }

        const employees = [
            { firstName: 'Juan', lastName: 'García', email: 'cocinero1@resttek.com', role: 'cocinero', restaurantId: 'rest-1' },
            { firstName: 'María', lastName: 'López', email: 'camarero1@resttek.com', role: 'camarero', restaurantId: 'rest-1' },
            { firstName: 'Pedro', lastName: 'Martínez', email: 'camarero2@resttek.com', role: 'camarero', restaurantId: 'rest-1' },
            { firstName: 'Roberto', lastName: 'Díaz', email: 'gerente1@resttek.com', role: 'manager', restaurantId: 'rest-1' },
            { firstName: 'Carlos', lastName: 'Sánchez', email: 'cocinero2@resttek.com', role: 'cocinero', restaurantId: 'rest-2' },
            { firstName: 'Ana', lastName: 'Fernández', email: 'camarero3@resttek.com', role: 'camarero', restaurantId: 'rest-2' },
            { firstName: 'Sofia', lastName: 'Rossi', email: 'gerente2@resttek.com', role: 'manager', restaurantId: 'rest-2' },
            { firstName: 'Laura', lastName: 'Gómez', email: 'cliente1@resttek.com', role: 'cliente', restaurantId: null },
            { firstName: 'Pablo', lastName: 'Ruiz', email: 'cliente2@resttek.com', role: 'cliente', restaurantId: null },
        ]

        for (const emp of employees) {
            if (!await employeeRepo.findByEmail(emp.email)) {
                const employee = Employee.create({
                    id: randomUUID(),
                    firstName: emp.firstName,
                    lastName: emp.lastName,
                    email: emp.email,
                    passwordHash: await authService.hashPassword(emp.email),
                    role: emp.role,
                    restaurantId: emp.restaurantId
                })
                await employeeRepo.save(employee)
                console.log(`${emp.role} created: ${emp.email} / ${emp.email}`)
            } else {
                console.log(`${emp.role} already exists: ${emp.email}`)
            }
        }

        await dbConfig.run(`
            INSERT OR IGNORE INTO restaurants (id, name, address, email, phone, owner_first_name, owner_last_name, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, ['rest-1', 'Restaurante El Gourmet', 'Calle Mayor 10, Madrid', 'info@gourmet.com', '912345678', 'Carlos', 'García', new Date().toISOString(), new Date().toISOString()])

        await dbConfig.run(`
            INSERT OR IGNORE INTO restaurants (id, name, address, email, phone, owner_first_name, owner_last_name, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, ['rest-2', 'Pizzería Napoli', 'Avenida del Sol 25, Barcelona', 'info@napoli.com', '934567890', 'Marco', 'Rossi', new Date().toISOString(), new Date().toISOString()])

        console.log('Restaurants created.')

        const ingredientsRest1 = [
            { id: randomUUID(), name: 'Tomate', unit: 'kg' },
            { id: randomUUID(), name: 'Queso mozzarella', unit: 'kg' },
            { id: randomUUID(), name: 'Aceite de oliva', unit: 'L' },
            { id: randomUUID(), name: 'Ajo', unit: 'kg' },
            { id: randomUUID(), name: 'Albahaca', unit: 'kg' },
        ]

        for (const ing of ingredientsRest1) {
            await dbConfig.run(`
                INSERT OR IGNORE INTO ingredients (id, name, unit, current_stock, restaurant_id, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [ing.id, ing.name, ing.unit, 10, 'rest-1', new Date().toISOString(), new Date().toISOString()])
        }

        const dish1Id = randomUUID()
        await dbConfig.run(`
            INSERT OR IGNORE INTO dishes (id, name, description, price, category, restaurant_id, available, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [dish1Id, 'Pizza Margarita', 'Pizza clásica con tomate, mozzarella y albahaca', 12.50, 'principal', 'rest-1', 1, new Date().toISOString(), new Date().toISOString()])

        await dbConfig.run(`INSERT OR IGNORE INTO dish_ingredients (dish_id, ingredient_id, quantity) VALUES (?, ?, ?)`, [dish1Id, ingredientsRest1[0].id, 0.3])
        await dbConfig.run(`INSERT OR IGNORE INTO dish_ingredients (dish_id, ingredient_id, quantity) VALUES (?, ?, ?)`, [dish1Id, ingredientsRest1[1].id, 0.4])
        await dbConfig.run(`INSERT OR IGNORE INTO dish_ingredients (dish_id, ingredient_id, quantity) VALUES (?, ?, ?)`, [dish1Id, ingredientsRest1[4].id, 0.05])

        const dish2Id = randomUUID()
        await dbConfig.run(`
            INSERT OR IGNORE INTO dishes (id, name, description, price, category, restaurant_id, available, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [dish2Id, 'Ensalada Caprese', 'Ensalada fresca con tomate, mozzarella y albahaca', 9.00, 'entrante', 'rest-1', 1, new Date().toISOString(), new Date().toISOString()])

        await dbConfig.run(`INSERT OR IGNORE INTO dish_ingredients (dish_id, ingredient_id, quantity) VALUES (?, ?, ?)`, [dish2Id, ingredientsRest1[0].id, 0.4])
        await dbConfig.run(`INSERT OR IGNORE INTO dish_ingredients (dish_id, ingredient_id, quantity) VALUES (?, ?, ?)`, [dish2Id, ingredientsRest1[1].id, 0.3])
        await dbConfig.run(`INSERT OR IGNORE INTO dish_ingredients (dish_id, ingredient_id, quantity) VALUES (?, ?, ?)`, [dish2Id, ingredientsRest1[4].id, 0.03])

        const dish3Id = randomUUID()
        await dbConfig.run(`
            INSERT OR IGNORE INTO dishes (id, name, description, price, category, restaurant_id, available, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [dish3Id, 'Bruschetta', 'Pan tostado con tomate, ajo y aceite de oliva', 7.50, 'entrante', 'rest-1', 1, new Date().toISOString(), new Date().toISOString()])

        await dbConfig.run(`INSERT OR IGNORE INTO dish_ingredients (dish_id, ingredient_id, quantity) VALUES (?, ?, ?)`, [dish3Id, ingredientsRest1[0].id, 0.2])
        await dbConfig.run(`INSERT OR IGNORE INTO dish_ingredients (dish_id, ingredient_id, quantity) VALUES (?, ?, ?)`, [dish3Id, ingredientsRest1[2].id, 0.05])
        await dbConfig.run(`INSERT OR IGNORE INTO dish_ingredients (dish_id, ingredient_id, quantity) VALUES (?, ?, ?)`, [dish3Id, ingredientsRest1[3].id, 0.01])

        await dbConfig.run(`
            INSERT OR IGNORE INTO dishes (id, name, description, price, category, restaurant_id, available, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [randomUUID(), 'Refresco de Cola', 'Bebida refrescante', 2.50, 'bebida', 'rest-1', 1, new Date().toISOString(), new Date().toISOString()])

        await dbConfig.run(`
            INSERT OR IGNORE INTO dishes (id, name, description, price, category, restaurant_id, available, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [randomUUID(), 'Agua Mineral', 'Agua mineral natural', 2.00, 'bebida', 'rest-1', 1, new Date().toISOString(), new Date().toISOString()])

        console.log('Restaurant 1 dishes created: 3 dishes + 2 drinks')

        const ingredientsRest2 = [
            { id: randomUUID(), name: 'Harina', unit: 'kg' },
            { id: randomUUID(), name: 'Levadura', unit: 'kg' },
            { id: randomUUID(), name: 'Tomate triturado', unit: 'kg' },
        ]

        for (const ing of ingredientsRest2) {
            await dbConfig.run(`
                INSERT OR IGNORE INTO ingredients (id, name, unit, current_stock, restaurant_id, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [ing.id, ing.name, ing.unit, 15, 'rest-2', new Date().toISOString(), new Date().toISOString()])
        }

        const dishNapoliId = randomUUID()
        await dbConfig.run(`
            INSERT OR IGNORE INTO dishes (id, name, description, price, category, restaurant_id, available, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [dishNapoliId, 'Pizza Napolitana', 'Pizza al estilo napolitano con tomate y mozzarella', 14.00, 'principal', 'rest-2', 1, new Date().toISOString(), new Date().toISOString()])

        await dbConfig.run(`INSERT OR IGNORE INTO dish_ingredients (dish_id, ingredient_id, quantity) VALUES (?, ?, ?)`, [dishNapoliId, ingredientsRest2[0].id, 0.5])
        await dbConfig.run(`INSERT OR IGNORE INTO dish_ingredients (dish_id, ingredient_id, quantity) VALUES (?, ?, ?)`, [dishNapoliId, ingredientsRest2[1].id, 0.02])
        await dbConfig.run(`INSERT OR IGNORE INTO dish_ingredients (dish_id, ingredient_id, quantity) VALUES (?, ?, ?)`, [dishNapoliId, ingredientsRest2[2].id, 0.3])

        await dbConfig.run(`
            INSERT OR IGNORE INTO dishes (id, name, description, price, category, restaurant_id, available, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [randomUUID(), 'Limonada Casera', 'Limonada recién hecha', 3.50, 'bebida', 'rest-2', 1, new Date().toISOString(), new Date().toISOString()])

        console.log('Restaurant 2 dishes created: 1 dish + 1 drink')

        const order1Id = randomUUID()
        await dbConfig.run(`
            INSERT OR IGNORE INTO orders (id, restaurant_id, table_id, client_id, created_at)
            VALUES (?, ?, ?, ?, ?)
        `, [order1Id, 'rest-1', '5', null, new Date().toISOString()])

        for (let i = 0; i < 2; i++) {
            await dbConfig.run(`
                INSERT OR IGNORE INTO order_items (id, order_id, dish_id, quantity, notes, status)
                VALUES (?, ?, ?, ?, ?, ?)
            `, [randomUUID(), order1Id, dish1Id, 1, null, 'pendiente'])
        }

        for (let i = 0; i < 3; i++) {
            await dbConfig.run(`
                INSERT OR IGNORE INTO order_items (id, order_id, dish_id, quantity, notes, status)
                VALUES (?, ?, ?, ?, ?, ?)
            `, [randomUUID(), order1Id, dish2Id, 1, 'Sin cebolla', 'pendiente'])
        }

        await dbConfig.run(`
            INSERT OR IGNORE INTO order_items (id, order_id, dish_id, quantity, notes, status)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [randomUUID(), order1Id, dish3Id, 1, null, 'preparando'])

        const drink1Id = (await dbConfig.get<{id: string}>('SELECT id FROM dishes WHERE name = ? AND restaurant_id = ?', ['Refresco de Cola', 'rest-1']))?.id
        if (drink1Id) {
            await dbConfig.run(`
                INSERT OR IGNORE INTO order_items (id, order_id, dish_id, quantity, notes, status)
                VALUES (?, ?, ?, ?, ?, ?)
            `, [randomUUID(), order1Id, drink1Id, 1, null, 'pendiente'])
        }

        const drink2Id = (await dbConfig.get<{id: string}>('SELECT id FROM dishes WHERE name = ? AND restaurant_id = ?', ['Agua Mineral', 'rest-1']))?.id
        if (drink2Id) {
            await dbConfig.run(`
                INSERT OR IGNORE INTO order_items (id, order_id, dish_id, quantity, notes, status)
                VALUES (?, ?, ?, ?, ?, ?)
            `, [randomUUID(), order1Id, drink2Id, 2, null, 'pendiente'])
        }

        console.log('Sample orders created')

        console.log('\n=== Seed completado ===')
        console.log('\nEmpleados:')
        console.log('  Admin: admin@resttek.com / admin@resttek.com')
        console.log('  Cocinero: cocinero1@resttek.com / cocinero1@resttek.com')
        console.log('  Camarero: camarero1@resttek.com / camarero1@resttek.com')
        console.log('  Camarero: camarero2@resttek.com / camarero2@resttek.com')
        console.log('  Gerente: gerente1@resttek.com / gerente1@resttek.com')
        console.log('  Cocinero: cocinero2@resttek.com / cocinero2@resttek.com')
        console.log('  Camarero: camarero3@resttek.com / camarero3@resttek.com')
        console.log('  Gerente: gerente2@resttek.com / gerente2@resttek.com')
        console.log('\nClientes:')
        console.log('  cliente1@resttek.com / cliente1@resttek.com')
        console.log('  cliente2@resttek.com / cliente2@resttek.com')

        await dbConfig.close()
    } catch (error) {
        console.error('Seed failed:', error)
        process.exit(1)
    }
}

seed()
