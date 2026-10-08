export type DishCategory = 'entrante' | 'principal' | 'postre' | 'bebida'

export interface DishIngredient {
  ingredientId: string
  quantity: number
}

export interface Dish {
  id: string
  name: string
  description: string | null
  price: number
  category: DishCategory
  available: boolean
  restaurantId: string
  ingredients: DishIngredient[]
  createdAt: string
  updatedAt: string
}

export interface CreateDishDto {
  name: string
  description: string | null
  price: number
  category: DishCategory
  available: boolean
  ingredients: DishIngredient[]
}
