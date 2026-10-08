import { Router } from 'express'
import { dbConfig } from '@config/database.js'
import { SqliteDishRepository } from '@repositories/dish.repository.js'
import { DishService } from '@services/dish.service.js'
import { DishController } from '@controllers/dish.controller.js'

const dishRepository = new SqliteDishRepository(dbConfig)
const dishService = new DishService(dishRepository)
const dishController = new DishController(dishService)

const router = Router({ mergeParams: true })

router.get('/', dishController.getPublic)

export default router
