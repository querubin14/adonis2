'use client'

import { Product } from '@/lib/types'
import ProductCard from './ProductCard'

export default function ProductMarquee({ products, reverse = false }: { products: Product[], reverse?: boolean }) {
  if (!products || products.length === 0) return null

  return (
    <div className="w-full py-4">
      <div className="flex gap-4 px-6 md:px-12 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4">
        {products.map((p) => (
          <div key={p.id} className="w-[200px] md:w-[280px] flex-shrink-0 snap-start">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </div>
  )
}
