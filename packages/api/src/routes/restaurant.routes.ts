import { Router } from 'express'
import { RestaurantController } from '@controllers/restaurant.controller.js'
import { dbConfig } from '@config/database.js'
import { SqliteRestaurantRepository } from '@repositories/restaurant.repository.js'
import { RestaurantService } from '@services/restaurant.service.js'
import { authenticate, authorize } from '@shared/infrastructure/http/middlewares.js'

const restaurantRepository = new SqliteRestaurantRepository(dbConfig)
const restaurantService = new RestaurantService(restaurantRepository)
const restaurantController = new RestaurantController(restaurantService)

const router = Router()

router.post('/', authenticate, authorize(['admin']), restaurantController.create)
router.get('/', authenticate, restaurantController.getAll)
router.get('/:id', authenticate, restaurantController.getById)
router.put('/:id', authenticate, authorize(['admin']), restaurantController.update)

export default router
