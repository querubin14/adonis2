'use client'

import { Product } from '@/lib/types'
import ProductCard from './ProductCard'

export default function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
      {products.map(p => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  )
}
