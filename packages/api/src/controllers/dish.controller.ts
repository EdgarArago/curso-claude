import type { Request, Response, NextFunction } from 'express'
import type { DishService } from '@services/dish.service.js'
import type { Dish } from '@models/dish.model.js'
import { DishNotFoundError } from '@errors/DomainErrors.js'

export class DishController {
    constructor(private readonly dishService: DishService) {}

    create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const dish = await this.dishService.create({
                name: req.body.name,
                description: req.body.description ?? null,
                price: req.body.price,
                category: req.body.category,
                available: req.body.available ?? true,
                restaurantId: req.params.restaurantId as string,
                ingredients: req.body.ingredients ?? []
            })
            res.status(201).json(this.toJSON(dish))
        } catch (error) {
            next(error)
        }
    }

    getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const dishes = await this.dishService.findByRestaurantId(req.params.restaurantId as string)
            res.status(200).json(dishes.map(d => this.toJSON(d)))
        } catch (error) {
            next(error)
        }
    }

    getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const dish = await this.dishService.findById(req.params.id as string)
            if (!dish) {
                throw new DishNotFoundError()
            }
            res.status(200).json(this.toJSON(dish))
        } catch (error) {
            next(error)
        }
    }

    update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const dish = await this.dishService.update(req.params.id as string, {
                name: req.body.name,
                description: req.body.description ?? null,
                price: req.body.price,
                category: req.body.category,
                available: req.body.available,
                ingredients: req.body.ingredients ?? []
            })
            res.status(200).json(this.toJSON(dish))
        } catch (error) {
            next(error)
        }
    }

    delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            await this.dishService.delete(req.params.id as string)
            res.status(204).send()
        } catch (error) {
            next(error)
        }
    }

    getPublic = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const dishes = await this.dishService.findByRestaurantId(req.params.restaurantId as string)
            const availableDishes = dishes.filter(d => d.available)
            res.status(200).json(availableDishes.map(d => this.toJSON(d)))
        } catch (error) {
            next(error)
        }
    }

    private toJSON(dish: Dish) {
        return {
            id: dish.id,
            name: dish.name,
            description: dish.description,
            price: dish.price,
            category: dish.category,
            available: dish.available,
            restaurantId: dish.restaurantId,
            ingredients: dish.ingredients.map(i => ({
                ingredientId: i.ingredientId,
                quantity: i.quantity
            })),
            createdAt: dish.createdAt,
            updatedAt: dish.updatedAt
        }
    }
}
