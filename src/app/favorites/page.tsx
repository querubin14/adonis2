'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { toast } from 'react-toastify'
import { getProducts, formatPrice } from '@/lib/data'
import { Product } from '@/lib/types'
import { useFavorites } from '@/hooks/useFavorites'
import { useCart } from '@/context/CartContext'

export default function FavoritesPage() {
  const [all, setAll] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { ids, toggle, ready } = useFavorites()
  const { add: addToCart, open: openCart } = useCart()

  useEffect(() => {
    getProducts().then(setAll).finally(() => setLoading(false))
  }, [])

  const favProducts = all.filter(p => ids.includes(p.id))

  function sendAllToCart() {
    favProducts.forEach(p => addToCart(p))
    openCart()
    toast(`${favProducts.length} pieza${favProducts.length !== 1 ? 's' : ''} añadida${favProducts.length !== 1 ? 's' : ''} al carrito`, {
      position: 'top-center',
      autoClose: 3000,
      hideProgressBar: true,
      closeButton: false,
      theme: 'dark',
      icon: false,
    })
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background text-on-background pt-32 pb-20 px-4 md:px-12">
        <header className="mb-10 border-b border-outline-variant/20 pb-8 flex items-end justify-between gap-4">
          <div>
            <h1 className="font-headline text-4xl md:text-5xl text-white uppercase tracking-tight">Favoritos</h1>
            <p className="text-[9px] uppercase tracking-widest text-neutral-500 font-bold mt-2">
              {ready ? `${ids.length} pieza${ids.length !== 1 ? 's' : ''} guardada${ids.length !== 1 ? 's' : ''}` : '—'}
            </p>
          </div>
          {favProducts.length > 0 && (
            <button
              onClick={sendAllToCart}
              className="flex items-center gap-2 px-6 py-3 bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-200 transition-all flex-shrink-0"
            >
              <span className="material-symbols-outlined text-sm" aria-hidden="true">shopping_bag</span>
              Enviar al carrito
            </button>
          )}
        </header>

        {loading || !ready ? (
          <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-neutral-700 border-t-white rounded-full animate-spin" />
          </div>
        ) : favProducts.length === 0 ? (
          <div className="flex flex-col items-center py-32 gap-5">
            <span className="material-symbols-outlined text-6xl text-neutral-800" aria-hidden="true">favorite_border</span>
            <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold text-center">
              Aún no tienes piezas guardadas
            </p>
            <Link href="/products"
              className="px-8 py-3 bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-200 transition-all">
              Explorar Colección
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
            {favProducts.map(p => (
              <div key={p.id} className="group flex flex-col">
                <div className="bg-surface-container-low aspect-[3/4] relative overflow-hidden mb-3 border border-outline-variant/5 group-hover:border-outline-variant/30 transition-colors">
                  <Link href={`/products/${p.slug}`}>
                    {p.images?.[0]
                      ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      : <div className="w-full h-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-3xl text-neutral-800" aria-hidden="true">diamond</span>
                        </div>
                    }
                  </Link>
                  {/* Action overlay */}
                  <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200">
                    <button onClick={() => toggle(p.id)} aria-label="Quitar de favoritos"
                      className="p-1.5 bg-white text-black hover:bg-red-100 transition-all">
                      <span className="material-symbols-outlined text-sm" aria-hidden="true"
                        style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                    </button>
                    <button onClick={() => addToCart(p)} aria-label="Agregar al carrito"
                      className="p-1.5 bg-black/60 text-white hover:bg-white hover:text-black transition-all">
                      <span className="material-symbols-outlined text-sm" aria-hidden="true">add_shopping_cart</span>
                    </button>
                  </div>
                </div>
                <Link href={`/products/${p.slug}`} className="space-y-0.5">
                  <h3 className="font-headline text-xs text-white uppercase tracking-wide leading-tight line-clamp-2">{p.name}</h3>
                  <p className="text-xs text-neutral-400 tabular-nums">{formatPrice(p.price)}</p>
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}
