import { Router } from 'express'
import { dbConfig } from '@config/database.js'
import { SqliteRestaurantRepository } from '@repositories/restaurant.repository.js'
import { RestaurantService } from '@services/restaurant.service.js'
import { RestaurantController } from '@controllers/restaurant.controller.js'

const restaurantRepository = new SqliteRestaurantRepository(dbConfig)
const restaurantService = new RestaurantService(restaurantRepository)
const restaurantController = new RestaurantController(restaurantService)

const router = Router()

router.get('/', restaurantController.getAllPublic)
router.get('/:id', restaurantController.getById)

export default router
