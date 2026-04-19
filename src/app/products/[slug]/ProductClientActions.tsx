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
    toast.success(`${product.name} añadido a su selección`, {
      position: 'top-center',
      theme: 'light',
      icon: false,
    })
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
        <p className="text-[11px] text-gray-500 font-medium">Cantidad</p>
        <div className="flex items-center border border-gray-400 w-fit h-11">
          <button 
            onClick={() => setQty(Math.max(1, qty - 1))}
            className="w-12 h-full flex items-center justify-center text-gray-500 hover:text-black transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">remove</span>
          </button>
          <span className="w-8 text-center text-sm font-medium text-black">{qty}</span>
          <button 
            onClick={() => setQty(qty + 1)}
            className="w-12 h-full flex items-center justify-center text-gray-500 hover:text-black transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 mt-2 font-sans">
        {/* Buttons matching screenshot style */}
        <button 
          onClick={handleAdd}
          className="w-full border border-black text-black py-3.5 text-[13px] hover:bg-gray-50 transition-colors tracking-wide"
        >
          Agregar al carrito
        </button>
        
        <button 
          onClick={handleBuyNow}
          className="w-full bg-[#111] text-white py-3.5 text-[13px] hover:bg-black transition-colors tracking-wide"
        >
          Comprar ahora
        </button>
      </div>
    </div>
  )
}

