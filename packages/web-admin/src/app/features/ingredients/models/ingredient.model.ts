export type IngredientUnit = 'kg' | 'g' | 'l' | 'ml' | 'unidad'

export interface Ingredient {
  id: string
  name: string
  unit: IngredientUnit
  currentStock: number
  restaurantId: string
  createdAt: string
  updatedAt: string
}

export interface CreateIngredientDto {
  name: string
  unit: IngredientUnit
  currentStock: number
}

export interface UpdateIngredientDto {
  name: string
  unit: IngredientUnit
  currentStock: number
}
