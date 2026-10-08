import { InvalidUnitError } from '@errors/DomainErrors.js'

const VALID_UNITS = ['kg', 'g', 'l', 'ml', 'unidad'] as const

export type IngredientUnitType = typeof VALID_UNITS[number]

export interface Ingredient {
    id: string
    name: string
    unit: IngredientUnitType
    currentStock: number
    restaurantId: string
    createdAt: string
    updatedAt: string
}

export function normalizeIngredientUnit(value: string): IngredientUnitType {
    if (!value || typeof value !== 'string') {
        throw new InvalidUnitError('Unit must be provided')
    }

    const normalizedValue = value.trim().toLowerCase()
    if (!VALID_UNITS.includes(normalizedValue as IngredientUnitType)) {
        throw new InvalidUnitError(`Invalid unit: ${value}. Must be one of: ${VALID_UNITS.join(', ')}`)
    }
    return normalizedValue as IngredientUnitType
}
