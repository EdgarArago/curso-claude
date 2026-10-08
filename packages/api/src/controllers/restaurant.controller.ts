import type { Request, Response, NextFunction } from 'express'
import type { RestaurantService } from '@services/restaurant.service.js'
import type { Restaurant } from '@models/restaurant.model.js'

export class RestaurantController {
    constructor(private readonly restaurantService: RestaurantService) {}

    create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const restaurant = await this.restaurantService.create({
                name: req.body.name,
                address: req.body.address,
                email: req.body.email,
                phone: req.body.phone,
                ownerFirstName: req.body.ownerFirstName,
                ownerLastName: req.body.ownerLastName,
                logoUrl: req.body.logoUrl ?? null
            })
            res.status(201).json(this.toJSON(restaurant))
        } catch (error) {
            next(error)
        }
    }

    getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const restaurant = await this.restaurantService.getById(req.params.id as string)
            res.status(200).json(this.toJSON(restaurant))
        } catch (error) {
            next(error)
        }
    }

    getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user = (req as any).user
            if (user?.role === 'admin') {
                const restaurants = await this.restaurantService.getAll()
                res.status(200).json(restaurants.map(r => this.toJSON(r)))
            } else {
                const restaurantId = user?.restaurantId
                if (!restaurantId) {
                    res.status(200).json([])
                    return
                }
                const restaurant = await this.restaurantService.getById(restaurantId)
                res.status(200).json([this.toJSON(restaurant)])
            }
        } catch (error) {
            next(error)
        }
    }

    getAllPublic = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const restaurants = await this.restaurantService.getAll()
            res.status(200).json(restaurants.map(r => this.toJSON(r)))
        } catch (error) {
            next(error)
        }
    }

    update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const restaurant = await this.restaurantService.update(req.params.id as string, {
                name: req.body.name,
                address: req.body.address,
                email: req.body.email,
                phone: req.body.phone,
                ownerFirstName: req.body.ownerFirstName,
                ownerLastName: req.body.ownerLastName,
                logoUrl: req.body.logoUrl ?? null
            })
            res.status(200).json(this.toJSON(restaurant))
        } catch (error) {
            next(error)
        }
    }

    private toJSON(restaurant: Restaurant) {
        return {
            id: restaurant.id,
            name: restaurant.name,
            address: restaurant.address,
            email: restaurant.email,
            phone: restaurant.phone,
            ownerFirstName: restaurant.ownerFirstName,
            ownerLastName: restaurant.ownerLastName,
            logoUrl: restaurant.logoUrl,
            createdAt: restaurant.createdAt,
            updatedAt: restaurant.updatedAt
        }
    }
}
