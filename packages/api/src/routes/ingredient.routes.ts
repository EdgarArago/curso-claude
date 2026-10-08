import { Router } from 'express'
import { IngredientController } from '@controllers/ingredient.controller.js'
import { dbConfig } from '@config/database.js'
import { SqliteIngredientRepository } from '@repositories/ingredient.repository.js'
import { IngredientService } from '@services/ingredient.service.js'
import { authenticate, authorize } from '@shared/infrastructure/http/middlewares.js'

const ingredientRepository = new SqliteIngredientRepository(dbConfig)
const ingredientService = new IngredientService(ingredientRepository)
const ingredientController = new IngredientController(ingredientService)

const router = Router({ mergeParams: true })

router.post('/', authenticate, authorize(['admin']), ingredientController.create)
router.get('/', authenticate, authorize(['admin', 'manager', 'cocinero']), ingredientController.getAll)
router.get('/:id', authenticate, authorize(['admin', 'manager', 'cocinero']), ingredientController.getById)
router.put('/:id', authenticate, authorize(['admin']), ingredientController.update)
router.delete('/:id', authenticate, authorize(['admin']), ingredientController.delete)

export default router
