'use client'

import { useState } from 'react'
import { useCart } from '@/context/CartContext'
import { useFavorites } from '@/hooks/useFavorites'
import { Product } from '@/lib/types'
import { toast } from 'react-toastify'

export default function ProductClientActions({ product }: { product: Product }) {
  const { add: addToCart, open: openCart } = useCart()
  const { toggle, ids } = useFavorites()
  const isFavorite = ids.includes(product.id)

  const [qty, setQty] = useState(1)

  function handleAdd() {
    for (let i = 0; i < qty; i++) {
      addToCart(product)
    }
    toast(
      <div className="flex items-center gap-3 py-1">
        <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined text-black text-[16px] font-bold">check</span>
        </div>
        <span className="text-white text-[14px] font-semibold tracking-wide">Producto añadido correctamente</span>
      </div>,
      {
        position: 'top-center',
        closeButton: true,
        icon: false,
        theme: 'dark'
      }
    )
    openCart()
  }

  function handleBuyNow() {
    addToCart(product)
    openCart()
  }

  function handleFavorite() {
    toggle(product.id)
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Quantity Selector */}
      <div className="space-y-2">
        <p className="text-[11px] text-neutral-500 font-medium">Cantidad</p>
        <div className="flex items-center border border-white/20 w-fit h-11">
          <button 
            onClick={() => setQty(Math.max(1, qty - 1))}
            className="w-12 h-full flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">remove</span>
          </button>
          <span className="w-8 text-center text-sm font-medium text-white">{qty}</span>
          <button 
            onClick={() => setQty(qty + 1)}
            className="w-12 h-full flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 mt-2 font-sans">
        {/* Buttons matching screenshot style */}
        <button 
          onClick={handleAdd}
          className="w-full border border-white text-white py-3.5 text-[11px] uppercase tracking-[0.2em] font-bold hover:bg-white hover:text-black transition-all"
        >
          Agregar al carrito
        </button>
        
        <button 
          onClick={handleBuyNow}
          className="w-full bg-white text-black py-3.5 text-[11px] uppercase tracking-[0.2em] font-extrabold hover:bg-neutral-200 transition-all font-bold"
        >
          Comprar ahora
        </button>
      </div>
    </div>
  )
}

