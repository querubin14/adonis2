'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { getProducts, getCategories } from '@/lib/data'
import { Category } from '@/lib/types'
import ProductCard from '@/components/ProductCard'

function ProductsContent() {
  const searchParams = useSearchParams()
  const initialCatSlug = searchParams.get('category')
  
  const [products, setProducts]   = useState<any[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [activeCat, setActiveCat] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [availability, setAvailability] = useState<'all' | 'in-stock'>('all')
  const [maxPrice, setMaxPrice] = useState<number>(1000000)
  const [sortOrder, setSortOrder] = useState<'best-selling' | 'newest' | 'price-low' | 'price-high'>('best-selling')

  useEffect(() => {
    Promise.all([getProducts(), getCategories()])
      .then(([prods, cats]) => { 
        setProducts(prods); 
        setCategories(cats);
        if (initialCatSlug) {
          const cat = cats.find(c => c.slug === initialCatSlug)
          if (cat) setActiveCat(cat.id)
        }
      })
      .finally(() => setLoading(false))
  }, [initialCatSlug])

  const rootCats = useMemo(
    () => categories.filter(c => !c.parent_id && !c.parentId),
    [categories]
  )

  const subCats = useMemo(() => {
    if (activeCat === 'all') return []
    const isRoot = rootCats.some(c => c.id === activeCat)
    const parentId = isRoot ? activeCat : categories.find(c => c.id === activeCat)?.parent_id || categories.find(c => c.id === activeCat)?.parentId
    if (!parentId) return []
    return categories.filter(c => (c.parent_id === parentId) || (c.parentId === parentId))
  }, [categories, activeCat, rootCats])

  const filtered = useMemo(() => {
    let result = products
    if (activeCat !== 'all') {
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
      result = products.filter(p => {
        const catId = (p as any).category_id ?? p.categoryId
        return catId && all.includes(catId)
      })
    }
    return result
  }, [products, categories, activeCat])

  const filteredAndSorted = useMemo(() => {
    let result = [...filtered]
    
    if (availability === 'in-stock') {
      result = result.filter(p => p.stock > 0)
    }

    result = result.filter(p => p.price <= maxPrice)

    if (sortOrder === 'price-low') {
      result.sort((a, b) => a.price - b.price)
    } else if (sortOrder === 'price-high') {
      result.sort((a, b) => b.price - a.price)
    } else if (sortOrder === 'newest') {
      result.sort((a, b) => new Date(b.created_at || b.createdAt || 0).getTime() - new Date(a.created_at || a.createdAt || 0).getTime())
    }
    
    return result
  }, [filtered, availability, sortOrder])

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

          {subCats.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 text-[9px] font-label uppercase tracking-[0.2em]">
              <button
                onClick={() => {
                  const parentCat = categories.find(c => c.id === subCats[0].parent_id || c.id === subCats[0].parentId);
                  if (parentCat) setActiveCat(parentCat.id);
                }}
                className={`px-3 py-1 font-bold transition-all border-b-2 ${
                  rootCats.some(c => c.id === activeCat)
                    ? 'border-white text-white'
                    : 'border-transparent text-neutral-500 hover:text-white'
                }`}
              >
                Todos
              </button>
              {subCats.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCat(cat.id)}
                  className={`px-3 py-1 font-bold transition-all border-b-2 ${
                    activeCat === cat.id
                      ? 'border-white text-white'
                      : 'border-transparent text-neutral-500 hover:text-white'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}

          {/* Filter Bar (Image 1) */}
          <div className="mt-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-[11px] uppercase tracking-wider font-medium text-neutral-400">
            <div className="flex items-center gap-8">
              <span className="text-neutral-500">Filtrar:</span>
              <div className="flex items-center gap-6">
                <div className="relative group">
                  <button className="flex items-center gap-1 hover:text-white transition-colors">
                    Disponibilidad <span className="material-symbols-outlined text-[14px]">expand_more</span>
                  </button>
                  <div className="absolute top-full left-0 mt-2 bg-neutral-900 border border-neutral-800 p-4 min-w-[150px] z-50 hidden group-hover:block shadow-2xl">
                    <label className="flex items-center gap-3 cursor-pointer hover:text-white py-1">
                      <input 
                        type="radio" 
                        name="availability" 
                        checked={availability === 'all'} 
                        onChange={() => setAvailability('all')}
                        className="accent-white"
                      />
                      Todos
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer hover:text-white py-1">
                      <input 
                        type="radio" 
                        name="availability" 
                        checked={availability === 'in-stock'} 
                        onChange={() => setAvailability('in-stock')}
                        className="accent-white"
                      />
                      En Stock
                    </label>
                  </div>
                </div>
                <div className="relative group">
                  <button className="flex items-center gap-1 hover:text-white transition-colors">
                    Precio <span className="material-symbols-outlined text-[14px]">expand_more</span>
                  </button>
                  <div className="absolute top-full left-0 mt-2 bg-neutral-900 border border-neutral-800 p-4 min-w-[200px] z-50 hidden group-hover:block shadow-2xl">
                    <p className="text-[9px] mb-4 text-neutral-500 uppercase tracking-widest font-bold">Máximo: {new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG' }).format(maxPrice)}</p>
                    <input 
                      type="range" 
                      min="0" 
                      max="1000000" 
                      step="10000"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                      className="w-full accent-white h-1 bg-neutral-800 rounded-full appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between mt-2 text-[8px] text-neutral-600 font-bold">
                      <span>Gs. 0</span>
                      <span>Gs. 1.000.000+</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <span className="text-neutral-500">Ordenar por:</span>
                <select 
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as any)}
                  className="bg-transparent text-white border-none outline-none cursor-pointer focus:ring-0 py-0 pr-8"
                >
                  <option value="best-selling" className="bg-neutral-900">Más vendidos</option>
                  <option value="newest" className="bg-neutral-900">Más nuevos</option>
                  <option value="price-low" className="bg-neutral-900">Precio: Menor a Mayor</option>
                  <option value="price-high" className="bg-neutral-900">Precio: Mayor a Menor</option>
                </select>
              </div>
              <span className="text-neutral-600 tabular-nums">{filteredAndSorted.length} productos</span>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="flex justify-center py-32">
            <div className="w-8 h-8 border-2 border-neutral-700 border-t-white rounded-full animate-spin" />
          </div>
        ) : filteredAndSorted.length === 0 ? (
          <div className="flex flex-col items-center py-32 gap-4">
            <span className="material-symbols-outlined text-5xl text-neutral-800" aria-hidden="true">diamond</span>
            <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">Sin piezas que coincidan con los filtros</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
            {filteredAndSorted.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen bg-background">
        <div className="w-8 h-8 border-2 border-neutral-700 border-t-white rounded-full animate-spin" />
      </div>
    }>
      <ProductsContent />
    </Suspense>
  )
}
