// Shared types for the Adonis Jewelry project

export interface Category {
  id: string
  name: string
  slug: string
  parentId?: string // For hierarchy (Parent > Child > Sub-branch)
  description?: string
}

export interface Product {
  id: string
  name: string
  slug: string
  price: number
  originalPrice?: number
  category: ProductCategory
  material: string
  description: string
  longDescription?: string
  images: string[]
  stock: number
  featured: boolean
  tags: string[]
  variants?: ProductVariant[]
  createdAt: string
}

export interface ProductVariant {
  id: string
  productId: string
  color: string
  colorHex: string
  image: string
  stock: number
  priceOverride?: number
}

export type ProductCategory =
  | 'rings'
  | 'necklaces'
  | 'earrings'
  | 'bracelets'
  | 'pendants'
  | 'sets'

export interface CartItem {
  product: Product
  quantity: number
  variant?: ProductVariant
}

export interface Order {
  id: string
  items: CartItem[]
  total: number
  status: OrderStatus
  customer: Customer
  createdAt: string
  shippingAddress?: Address
}

export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'

export interface Customer {
  id: string
  name: string
  email: string
  phone?: string
  totalOrders: number
  totalSpent: number
  joinedAt: string
}

export interface Address {
  street: string
  city: string
  department: string
  country: string
  postalCode?: string
}

export interface AdminStats {
  totalRevenue: number
  totalOrders: number
  totalCustomers: number
  totalProducts: number
  revenueChange: number
  ordersChange: number
}
