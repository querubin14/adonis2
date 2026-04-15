'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { MOCK_PRODUCTS, formatPrice } from '@/lib/data'
import Link from 'next/link'

export default function ProductsPage() {
  const [category, setCategory] = useState<'All' | 'Anillos' | 'Collares' | 'Aretes' | 'Pulseras'>('All')

  const filteredProducts = category === 'All' 
    ? MOCK_PRODUCTS 
    : MOCK_PRODUCTS.filter(p => p.category === category)

  const categories = [
    { label: 'Todos', value: 'All' },
    { label: 'Anillos', value: 'Anillos' },
    { label: 'Collares', value: 'Collares' },
    { label: 'Aretes', value: 'Aretes' },
    { label: 'Pulseras', value: 'Pulseras' },
  ]

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background text-on-background pt-32 pb-20 px-6 md:px-12">
        <header className="mb-20 border-b border-outline-variant/20 pb-12">
          <h1 className="font-headline text-5xl md:text-7xl mb-6 text-white uppercase tracking-tight">La Colección</h1>
          <div className="flex flex-wrap gap-8 text-[10px] font-label uppercase tracking-[0.3em] text-neutral-500">
            {categories.map(cat => (
              <button 
                key={cat.value}
                onClick={() => setCategory(cat.value as any)}
                className={`transition-colors hover:text-white font-bold ${category === cat.value ? 'text-white border-b border-white pb-1' : ''}`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {filteredProducts.map(product => (
            <Link key={product.id} href={`/products/${product.slug}`} className="group flex flex-col">
              <div className="bg-surface p-12 aspect-[4/5] flex items-center justify-center mb-8 relative overflow-hidden transition-colors group-hover:bg-surface-container">
                <div className="w-full h-full bg-neutral-800 opacity-20 absolute inset-0 group-hover:opacity-10 transition-opacity" />
                <div className="w-full h-full flex items-center justify-center text-[10px] tracking-widest text-neutral-600 font-bold uppercase p-8 text-center">
                  Archivo Adonis <br/> [ {product.id} ]
                </div>
                <button className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-on-primary p-3">
                  <span className="material-symbols-outlined text-sm">add</span>
                </button>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-[0.2em] text-secondary font-label font-bold">{product.material}</p>
                <h4 className="font-headline text-lg text-white group-hover:text-primary transition-colors uppercase tracking-tight">{product.name}</h4>
                <p className="font-sans text-base text-primary-container font-light">{formatPrice(product.price)}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </>
  )
}
