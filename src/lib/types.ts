// Shared types for the Adonis Jewelry project

export interface Category {
  id: string
  name: string
  slug: string
  parent_id?: string | null
  /** @deprecated use parent_id */
  parentId?: string
  description?: string
  image?: string | null
  sort_order?: number
  created_at?: string
  // UI-only: populated by buildCategoryTree
  children?: Category[]
  depth?: number
}

export interface Product {
  id: string
  name: string
  slug: string
  price: number
  originalPrice?: number
  category: ProductCategory | string
  categoryId?: string
  material: string
  description: string
  longDescription?: string
  images: string[]
  stock: number
  featured?: boolean
  tags?: string[]
  variants?: ProductVariant[]
  length?: string
  thickness?: string
  createdAt?: string
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

export interface HeroSettings {
  id: string
  title: string
  subtitle?: string | null
  image_url?: string | null
  cta_text?: string | null
  cta_url?: string | null
  is_active?: boolean
  sort_order?: number
  updated_at?: string
}

export interface BentoItem {
  id: string
  title: string
  subtitle?: string | null
  image_url?: string | null
  link_url?: string | null
  sort_order?: number
  is_active?: boolean
  created_at?: string
}

export interface Review {
  id: string
  name: string
  location?: string | null
  rating: number
  text: string
  photo_url?: string | null
  is_active?: boolean
  sort_order?: number
  created_at?: string
}

export interface NavLink {
  id: string
  label: string
  url: string
  parent_id?: string | null
  sort_order?: number
  is_active?: boolean
  created_at?: string
  // UI-only: populated by buildNavTree
  children?: NavLink[]
}

export interface AdminStats {
  totalRevenue: number
  totalOrders: number
  totalCustomers: number
  totalProducts: number
  revenueChange: number
  ordersChange: number
}
