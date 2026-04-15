import { supabase } from './supabase'
import { Product, Category, Order } from './types'

// Fallback Mock Data
export const MOCK_CATEGORIES: Category[] = [
  { id: '1', name: 'Alta Joyería', slug: 'alta-joyeria' },
  { id: '2', name: 'Colección Diaria', slug: 'diaria' },
  { id: '1-1', name: 'Anillos de Gala', slug: 'anillos-gala', parentId: '1' },
]

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Anillo Nocturnal',
    slug: 'anillo-nocturnal',
    category: 'Anillos de Gala',
    categoryId: '1-1',
    price: 3500000,
    material: 'Oro Blanco 18k & Diamante Negro',
    description: 'Una pieza de arquitectura weightless que captura la esencia del vacío.',
    stock: 5,
    images: []
  }
]

// Supabase fetching logic
export async function getProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
  
  if (error) {
    console.error('Error fetching products:', error)
    return MOCK_PRODUCTS // Fallback for dev
  }
  return data as Product[]
}

export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
  
  if (error) {
    console.error('Error fetching categories:', error)
    return MOCK_CATEGORIES // Fallback for dev
  }
  return data as Category[]
}

export async function insertProduct(product: Partial<Product>) {
  const { data, error } = await supabase
    .from('products')
    .insert([product])
    .select()
  
  if (error) throw error
  return data[0]
}

export async function insertCategory(category: Partial<Category>) {
  const { data, error } = await supabase
    .from('categories')
    .insert([category])
    .select()
  
  if (error) throw error
  return data[0]
}

export const formatPrice = (price: number) => {
  return new Intl.NumberFormat('es-PY', {
    style: 'currency',
    currency: 'PYG',
    minimumFractionDigits: 0
  }).format(price).replace('PYG', 'Gs.')
}
