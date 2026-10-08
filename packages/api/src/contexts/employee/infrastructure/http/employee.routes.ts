import { Router } from 'express'
import { employeeController } from '@employee/infrastructure/http/dependencies.js'
import { authenticate, authorize } from '@shared/infrastructure/http/middlewares.js'

const router = Router()

router.post('/', authenticate, authorize(['admin']), employeeController.createEmployee)
router.get('/', authenticate, authorize(['admin']), employeeController.listEmployees)
router.get('/:id', authenticate, authorize(['admin']), employeeController.getEmployee)

export default router
