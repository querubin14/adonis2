'use client'

import { useState, useEffect, useMemo } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { getProducts, getCategories } from '@/lib/data'
import { Category } from '@/lib/types'
import ProductCard from '@/components/ProductCard'

export default function ProductsPage() {
  const [products, setProducts]   = useState<any[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading]     = useState(true)
  const [activeCat, setActiveCat] = useState<string>('all')

  useEffect(() => {
    Promise.all([getProducts(), getCategories()])
      .then(([prods, cats]) => { setProducts(prods); setCategories(cats) })
      .finally(() => setLoading(false))
  }, [])

  const rootCats = useMemo(
    () => categories.filter(c => !c.parent_id && !c.parentId),
    [categories]
  )

  const filtered = useMemo(() => {
    if (activeCat === 'all') return products
    const all: string[] = [activeCat]
    function descend(nodes: Category[]) {
      nodes.forEach(n => {
        if (n.parent_id === activeCat || all.includes(n.parent_id ?? '')) {
          all.push(n.id)
          descend(n.children ?? [])
        }
      })
    }
    descend(categories)
    return products.filter(p => {
      const catId = (p as any).category_id ?? p.categoryId
      return catId && all.includes(catId)
    })
  }, [products, categories, activeCat])

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background text-on-background pt-32 pb-20 px-4 md:px-12">

        {/* Header */}
        <header className="mb-10 border-b border-outline-variant/20 pb-10">
          <h1 className="font-headline text-4xl md:text-6xl mb-6 text-white uppercase tracking-tight">La Colección</h1>

          {/* Category filter chips */}
          <div className="flex flex-wrap gap-2 text-[10px] font-label uppercase tracking-[0.3em]">
            <button
              onClick={() => setActiveCat('all')}
              className={`px-4 py-1.5 font-bold transition-all ${
                activeCat === 'all'
                  ? 'bg-white text-black'
                  : 'border border-neutral-700 text-neutral-400 hover:text-white hover:border-white'
              }`}
            >
              Todos ({products.length})
            </button>
            {rootCats.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCat(cat.id)}
                className={`px-4 py-1.5 font-bold transition-all ${
                  activeCat === cat.id
                    ? 'bg-white text-black'
                    : 'border border-neutral-700 text-neutral-400 hover:text-white hover:border-white'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </header>

        {loading ? (
          <div className="flex justify-center py-32">
            <div className="w-8 h-8 border-2 border-neutral-700 border-t-white rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-32 gap-4">
            <span className="material-symbols-outlined text-5xl text-neutral-800" aria-hidden="true">diamond</span>
            <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">Sin piezas en esta categoría</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
            {filtered.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}
