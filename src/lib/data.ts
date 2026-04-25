import { supabase } from './supabase'
import { Product, Category, HeroSettings, Review, BentoItem, NavLink, StoreSettings } from './types'

// ── Mock fallbacks (dev without DB) ────────────────────────────────
export const MOCK_CATEGORIES: Category[] = [
  { id: '1',   name: 'Alta Joyería',      slug: 'alta-joyeria',   sort_order: 1 },
  { id: '2',   name: 'Colección Diaria',  slug: 'coleccion-diaria', sort_order: 2 },
  { id: '1-1', name: 'Anillos de Gala',   slug: 'anillos-gala',   parent_id: '1', sort_order: 1 },
  { id: '1-1-1', name: 'Solitarios',      slug: 'solitarios',     parent_id: '1-1', sort_order: 1 },
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
    images: [],
  },
]

// ── Category tree builder ──────────────────────────────────────────
export function buildCategoryTree(flat: Category[]): Category[] {
  const map = new Map<string, Category>()
  flat.forEach(c => map.set(c.id, { ...c, children: [] }))

  const roots: Category[] = []
  map.forEach(node => {
    const pid = node.parent_id ?? node.parentId
    if (pid && map.has(pid)) {
      map.get(pid)!.children!.push(node)
    } else {
      roots.push(node)
    }
  })

  // Sort every level by sort_order
  function sortLevel(nodes: Category[]): Category[] {
    return nodes
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      .map(n => ({ ...n, children: sortLevel(n.children ?? []) }))
  }

  return sortLevel(roots)
}

/** Flatten a tree back to a list with depth info — useful for <select> */
export function flattenTree(
  nodes: Category[],
  depth = 0
): (Category & { depth: number })[] {
  return nodes.flatMap(n => [
    { ...n, depth },
    ...flattenTree(n.children ?? [], depth + 1),
  ])
}

// ── Products ────────────────────────────────────────────────────────
export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')

  if (error) {
    console.error('[getProducts]', error.message, error.code)
    return MOCK_PRODUCTS
  }
  return data as Product[]
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // Not found
    console.error('[getProductBySlug]', error.message, error.code)
    return MOCK_PRODUCTS.find(p => p.slug === slug) || null
  }
  return data as Product
}

export async function insertProduct(product: Partial<Product>) {
  const { data, error } = await supabase
    .from('products')
    .insert([product])
    .select()

  if (error) throw error
  return data[0] as Product
}

export async function updateProduct(id: string, updates: Partial<Product>) {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()

  if (error) throw error
  return data[0] as Product
}

export async function deleteProduct(id: string) {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ── Categories ──────────────────────────────────────────────────────
export async function getCategories(): Promise<Category[]> {
  // No DB-level sort — buildCategoryTree handles it in memory,
  // so we don't break if sort_order column doesn't exist yet.
  const { data, error } = await supabase
    .from('categories')
    .select('*')

  if (error) {
    console.error('[getCategories]', error.message, error.code)
    return MOCK_CATEGORIES
  }
  return data as Category[]
}

type CategoryPayload = {
  name?: string
  slug?: string
  description?: string | null
  parent_id?: string | null
  image?: string | null
  sort_order?: number
}

export async function insertCategory(category: CategoryPayload) {
  const { data, error } = await supabase
    .from('categories')
    .insert([category])
    .select()

  if (error) throw error
  return data[0] as Category
}

export async function updateCategory(id: string, updates: CategoryPayload) {
  const { data, error } = await supabase
    .from('categories')
    .update(updates)
    .eq('id', id)
    .select()

  if (error) throw error
  return data[0] as Category
}

export async function deleteCategory(id: string) {
  // Reassign children to the deleted category's parent first
  const { data: cat } = await supabase
    .from('categories')
    .select('parent_id')
    .eq('id', id)
    .single()

  if (cat) {
    await supabase
      .from('categories')
      .update({ parent_id: cat.parent_id ?? null })
      .eq('parent_id', id)
  }

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ── Hero ────────────────────────────────────────────────────────────
/** Returns all active heroes ordered by sort_order */
export async function getHeroes(): Promise<HeroSettings[]> {
  const { data, error } = await supabase
    .from('hero_settings')
    .select('*')
    .eq('is_active', true)

  if (error) {
    console.error('[getHeroes]', error.message, error.code)
    return []
  }
  return (data as HeroSettings[] || []).sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
}

/** Returns all heroes (including inactive) for the admin */
export async function getAllHeroes(): Promise<HeroSettings[]> {
  const { data, error } = await supabase
    .from('hero_settings')
    .select('*')

  if (error) {
    console.error('[getAllHeroes]', error.message, error.code)
    return []
  }
  return (data as HeroSettings[] || []).sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
}

/** Kept for backwards compat — returns the first active hero */
export async function getHero(): Promise<HeroSettings | null> {
  const heroes = await getHeroes()
  return heroes[0] ?? null
}

export async function insertHero(payload: Partial<Omit<HeroSettings, 'id'>>) {
  const { data, error } = await supabase
    .from('hero_settings')
    .insert([{ is_active: true, sort_order: 0, ...payload }])
    .select()

  if (error) {
    console.error('[insertHero] error:', error)
    throw error
  }
  return (data && data[0]) as HeroSettings
}

export async function saveHero(id: string, updates: Partial<Omit<HeroSettings, 'id'>>) {
  const { data, error } = await supabase
    .from('hero_settings')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()

  if (error) {
    console.error('[saveHero] error:', error)
    throw error
  }
  return (data && data[0]) as HeroSettings
}

export async function deleteHero(id: string) {
  const { error } = await supabase
    .from('hero_settings')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ── Bento Items ─────────────────────────────────────────────────────
export async function getBentoItems(): Promise<BentoItem[]> {
  const { data, error } = await supabase
    .from('bento_items')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
  if (error) { console.error('[getBentoItems]', error.message); return [] }
  return data as BentoItem[]
}

export async function getAllBentoItems(): Promise<BentoItem[]> {
  const { data, error } = await supabase
    .from('bento_items')
    .select('*')
    .order('sort_order', { ascending: true })
  if (error) { console.error('[getAllBentoItems]', error.message); return [] }
  return data as BentoItem[]
}

export async function insertBentoItem(payload: Omit<BentoItem, 'id' | 'created_at'>) {
  const { data, error } = await supabase.from('bento_items').insert([payload]).select()
  if (error) {
    console.error('[insertBentoItem] error:', error)
    throw error
  }
  return (data && data[0]) as BentoItem
}

export async function updateBentoItem(id: string, updates: Partial<Omit<BentoItem, 'id' | 'created_at'>>) {
  const { data, error } = await supabase.from('bento_items').update(updates).eq('id', id).select()
  if (error) {
    console.error('[updateBentoItem] error:', error)
    throw error
  }
  return (data && data[0]) as BentoItem
}

export async function deleteBentoItem(id: string) {
  const { error } = await supabase.from('bento_items').delete().eq('id', id)
  if (error) throw error
}

// ── Reviews ─────────────────────────────────────────────────────────
/** Active reviews for the frontend, ordered by sort_order */
export async function getReviews(): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('[getReviews]', error.message, error.code)
    return []
  }
  return data as Review[]
}

/** All reviews for the admin panel */
export async function getAllReviews(): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('[getAllReviews]', error.message, error.code)
    return []
  }
  return data as Review[]
}

export async function insertReview(payload: Omit<Review, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('reviews')
    .insert([{ is_active: true, sort_order: 0, ...payload }])
    .select()

  if (error) throw error
  return data[0] as Review
}

export async function updateReview(id: string, updates: Partial<Omit<Review, 'id' | 'created_at'>>) {
  const { data, error } = await supabase
    .from('reviews')
    .update(updates)
    .eq('id', id)
    .select()

  if (error) throw error
  return data[0] as Review
}

export async function deleteReview(id: string) {
  const { error } = await supabase.from('reviews').delete().eq('id', id)
  if (error) throw error
}

// ── Nav Links ────────────────────────────────────────────────────────
/** Active nav links for the frontend */
export async function getNavLinks(): Promise<NavLink[]> {
  const { data, error } = await supabase
    .from('nav_links')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
  if (error) { console.error('[getNavLinks]', error.message); return [] }
  return data as NavLink[]
}

/** All nav links for the admin panel */
export async function getAllNavLinks(): Promise<NavLink[]> {
  const { data, error } = await supabase
    .from('nav_links')
    .select('*')
    .order('sort_order', { ascending: true })
  if (error) { console.error('[getAllNavLinks]', error.message); return [] }
  return data as NavLink[]
}

export async function insertNavLink(payload: Omit<NavLink, 'id' | 'created_at' | 'children'>) {
  const { data, error } = await supabase.from('nav_links').insert([payload]).select()
  if (error) throw error
  return data[0] as NavLink
}

export async function updateNavLink(id: string, updates: Partial<Omit<NavLink, 'id' | 'created_at' | 'children'>>) {
  const { data, error } = await supabase.from('nav_links').update(updates).eq('id', id).select()
  if (error) throw error
  return data[0] as NavLink
}

export async function deleteNavLink(id: string) {
  const { error } = await supabase.from('nav_links').delete().eq('id', id)
  if (error) throw error
}

// ── Helpers ─────────────────────────────────────────────────────────
export const formatPrice = (price: number) =>
  new Intl.NumberFormat('es-PY', {
    style: 'currency',
    currency: 'PYG',
    minimumFractionDigits: 0,
  })
    .format(price)
    .replace('PYG', 'Gs.')

// ── SETTINGS ─────────────────────────────────────────────────────────────

export async function getSettings(): Promise<StoreSettings | null> {
  const { data, error } = await supabase
    .from('store_settings')
    .select('*')
    .eq('id', '00000000-0000-0000-0000-000000000001')
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching settings:', error)
    return null
  }
  
  return data as StoreSettings | null
}

export async function updateSettings(updates: Partial<StoreSettings>) {
  const { data, error } = await supabase
    .from('store_settings')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', '00000000-0000-0000-0000-000000000001')
    .select()
    .single()

  if (error) {
    console.error('Error updating settings:', error)
    throw error
  }
  
  return data as StoreSettings
}
