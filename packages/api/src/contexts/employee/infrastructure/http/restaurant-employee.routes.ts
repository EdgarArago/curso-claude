import { Router } from 'express'
import { employeeController } from '@employee/infrastructure/http/dependencies.js'
import { authenticate, authorize } from '@shared/infrastructure/http/middlewares.js'

const router = Router({ mergeParams: true })

router.get('/', authenticate, authorize(['admin']), employeeController.listEmployeesByRestaurant)

export default router
