'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { toast } from 'react-toastify'
import { Product } from '@/lib/types'
import { useCart } from '@/context/CartContext'
import { useFavorites } from '@/hooks/useFavorites'
import { formatPrice } from '@/lib/data'

export default function ProductCard({ product: p }: { product: Product }) {
  const { add } = useCart()
  const { isFav, toggle } = useFavorites()
  const fav = isFav(p.id)
  const [popping, setPopping] = useState(false)
  const popTimer = useRef<NodeJS.Timeout | null>(null)

  function handleToggleFav() {
    const willFav = !fav
    toggle(p.id)
    if (willFav) {
      if (popTimer.current) clearTimeout(popTimer.current)
      setPopping(true)
      popTimer.current = setTimeout(() => setPopping(false), 400)
      toast('Guardado en favoritos', {
        position: 'top-center',
        autoClose: 3000,
        hideProgressBar: true,
        closeButton: false,
        theme: 'dark',
        icon: false,
      })
    } else {
      toast('Quitado de favoritos', {
        position: 'top-center',
        autoClose: 3000,
        hideProgressBar: true,
        closeButton: false,
        theme: 'dark',
      })
    }
  }

  function handleAddToCart() {
    add(p)
    toast(`${p.name} añadido al carrito`, {
      position: 'top-center',
      autoClose: 3000,
      hideProgressBar: true,
      closeButton: false,
      theme: 'dark',
      icon: false,
    })
  }

  return (
    <div className="group flex flex-col p-4 border border-black bg-white transition-all duration-500 rounded-none hover:shadow-xl hover:shadow-black/5">

      {/* Image container — Link covers only the image area */}
      <div className="bg-neutral-50 aspect-[3/4] relative overflow-hidden mb-4 border border-black group-hover:border-black transition-all duration-500">



        {/* Image link */}
        <Link href={`/products/${p.slug || p.id}`} className="block w-full h-full" tabIndex={-1} aria-hidden="true">
          {p.images?.[0] ? (
            <img
              src={p.images[0]}
              alt={p.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2">
              <span className="material-symbols-outlined text-3xl text-neutral-800" aria-hidden="true">diamond</span>
            </div>
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-300" />
        </Link>

        {/* ── Favorite button (top-right, always visible) ── */}
        <button
          type="button"
          onClick={handleToggleFav}
          aria-label={fav ? `Quitar ${p.name} de favoritos` : `Guardar ${p.name} en favoritos`}
          className="absolute top-2 right-2 z-10 p-1 transition-colors duration-200"
        >
          <span
            className={`material-symbols-outlined text-xl leading-none transition-colors duration-200 ${
              fav ? 'text-rose-400' : 'text-white/80 hover:text-rose-400'
            } ${popping ? 'heart-pop' : ''}`}
            aria-hidden="true"
            style={{
              fontVariationSettings: fav ? "'FILL' 1" : "'FILL' 0",
              filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.7))',
            }}
          >
            favorite
          </span>
        </button>

        {/* ── Add to cart button (bottom-right, always visible when in stock) ── */}
        {(p.stock ?? 0) > 0 && (
          <button
            type="button"
            onClick={handleAddToCart}
            aria-label={`Agregar ${p.name} al carrito`}
            className="absolute bottom-2 right-2 z-10 p-1.5 bg-black/50 text-white hover:bg-white hover:text-black transition-colors duration-200"
          >
            <span className="material-symbols-outlined text-sm leading-none" aria-hidden="true">add_shopping_cart</span>
          </button>
        )}

        {/* Stock badges */}
        {(p.stock ?? 0) === 0 && (
          <div className="absolute bottom-2 left-2 bg-black/70 px-2 py-0.5">
            <span className="text-[7px] uppercase tracking-widest text-neutral-400 font-bold">Agotado</span>
          </div>
        )}
        {(p.stock ?? 0) > 0 && (p.stock ?? 0) <= 3 && (
          <div className="absolute bottom-2 left-2 bg-yellow-900/70 px-2 py-0.5">
            <span className="text-[7px] uppercase tracking-widest text-yellow-300 font-bold">Últimas {p.stock}</span>
          </div>
        )}
      </div>

      {/* Info — separate Link for text */}
      <Link href={`/products/${p.slug || p.id}`} className="space-y-1 group/info">
        <div className="min-h-[12px]">
          {p.material && (
            <p className="text-[8px] uppercase tracking-[0.3em] text-neutral-500 font-bold truncate">{p.material}</p>
          )}
        </div>
        <div className="min-h-[28px]">
          <h3 className="text-[10px] text-neutral-600 group-hover/info:text-black transition-colors uppercase tracking-wide leading-tight line-clamp-2 font-medium">
            {p.name}
          </h3>
        </div>
        <div className="flex items-baseline gap-2 pt-1">
          <p className="text-sm font-bold text-black tabular-nums">
            {formatPrice(p.price)}
          </p>
          {(p as any).original_price && (
            <p className="text-[9px] text-neutral-400 line-through tabular-nums">
              {formatPrice((p as any).original_price)}
            </p>
          )}
        </div>

      </Link>

    </div>
  )
}
