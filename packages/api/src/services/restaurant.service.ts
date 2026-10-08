import { randomUUID } from 'crypto'
import type { Restaurant } from '@models/restaurant.model.js'
import type { RestaurantRepository } from '@repositories/restaurant.repository.js'
import { Email } from '@shared/domain/value-objects/Email.js'
import {
    RestaurantNameRequiredError,
    RestaurantAddressRequiredError,
    OwnerFirstNameRequiredError,
    OwnerLastNameRequiredError,
    InvalidPhoneError,
    RestaurantNotFoundError
} from '@errors/DomainErrors.js'

export interface CreateRestaurantDTO {
    name: string
    address: string
    email: string
    phone: string
    ownerFirstName: string
    ownerLastName: string
    logoUrl: string | null
}

export interface UpdateRestaurantDTO {
    name: string
    address: string
    email: string
    phone: string
    ownerFirstName: string
    ownerLastName: string
    logoUrl: string | null
}

const PHONE_REGEX = /^\+?[\d\s\-()]{7,20}$/

export class RestaurantService {
    constructor(private readonly restaurantRepository: RestaurantRepository) {}

    async create(dto: CreateRestaurantDTO): Promise<Restaurant> {
        const now = new Date().toISOString()
        const restaurant = this.buildRestaurant({
            id: randomUUID(),
            name: dto.name,
            address: dto.address,
            email: dto.email,
            phone: dto.phone,
            ownerFirstName: dto.ownerFirstName,
            ownerLastName: dto.ownerLastName,
            logoUrl: dto.logoUrl,
            createdAt: now,
            updatedAt: now
        })

        await this.restaurantRepository.save(restaurant)
        return restaurant
    }

    async update(id: string, dto: UpdateRestaurantDTO): Promise<Restaurant> {
        const existing = await this.restaurantRepository.findById(id)
        if (!existing) {
            throw new RestaurantNotFoundError()
        }

        const updated = this.buildRestaurant({
            id: existing.id,
            name: dto.name,
            address: dto.address,
            email: dto.email,
            phone: dto.phone,
            ownerFirstName: dto.ownerFirstName,
            ownerLastName: dto.ownerLastName,
            logoUrl: dto.logoUrl,
            createdAt: existing.createdAt,
            updatedAt: new Date().toISOString()
        })

        await this.restaurantRepository.save(updated)
        return updated
    }

    async getById(id: string): Promise<Restaurant> {
        const restaurant = await this.restaurantRepository.findById(id)
        if (!restaurant) {
            throw new RestaurantNotFoundError()
        }
        return restaurant
    }

    async getAll(): Promise<Restaurant[]> {
        return this.restaurantRepository.findAll()
    }

    private buildRestaurant(props: {
        id: string
        name: string
        address: string
        email: string
        phone: string
        ownerFirstName: string
        ownerLastName: string
        logoUrl: string | null
        createdAt: string
        updatedAt: string
    }): Restaurant {
        if (!props.name || props.name.trim() === '') {
            throw new RestaurantNameRequiredError()
        }
        if (!props.address || props.address.trim() === '') {
            throw new RestaurantAddressRequiredError()
        }
        if (!props.ownerFirstName || props.ownerFirstName.trim() === '') {
            throw new OwnerFirstNameRequiredError()
        }
        if (!props.ownerLastName || props.ownerLastName.trim() === '') {
            throw new OwnerLastNameRequiredError()
        }

        const email = new Email(props.email).getValue()
        if (!PHONE_REGEX.test(props.phone)) {
            throw new InvalidPhoneError()
        }

        return {
            id: props.id,
            name: props.name,
            address: props.address,
            email,
            phone: props.phone,
            ownerFirstName: props.ownerFirstName,
            ownerLastName: props.ownerLastName,
            logoUrl: props.logoUrl,
            createdAt: props.createdAt,
            updatedAt: props.updatedAt
        }
    }
}
