'use client'

import { Product } from '@/lib/types'
import ProductCard from './ProductCard'

export default function ProductMarquee({ products, reverse = false }: { products: Product[], reverse?: boolean }) {
  if (!products || products.length === 0) return null

  return (
    <div className="overflow-hidden w-full py-2">
      <div 
        className={`flex ${reverse ? 'marquee-track-reverse' : 'marquee-track'}`} 
        style={{ animationDuration: '40s' }}
      >
        {[0, 1].map(half => (
          <div key={half} className="flex gap-3 md:gap-4 px-1.5 md:px-2 items-center flex-shrink-0">
            {[0, 1].map(copy => (
              <div key={copy} className="flex gap-3 md:gap-4 items-center">
                {products.map((p, idx) => (
                  <div key={`${half}-${copy}-${p.id}-${idx}`} className="w-[160px] md:w-[240px] flex-shrink-0">
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
