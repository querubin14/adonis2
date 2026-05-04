'use client'

import { useState } from 'react'
import { useCart } from '@/context/CartContext'
import { useFavorites } from '@/hooks/useFavorites'
import { Product } from '@/lib/types'
import { toast } from 'react-toastify'

export default function ProductClientActions({ product, whatsappNumber }: { product: Product, whatsappNumber?: string | null }) {
  const { add: addToCart, open: openCart } = useCart()
  const { toggle, ids } = useFavorites()
  const isFavorite = ids.includes(product.id)

  const [qty, setQty] = useState(1)
  const [selectedSize, setSelectedSize] = useState<string | null>(
    product.variants?.find(v => v.size)?.size || null
  )

  const availableSizes = Array.from(new Set(product.variants?.map(v => v.size).filter(Boolean))) as string[]

  function handleAdd() {
    const variant = product.variants?.find(v => v.size === selectedSize)
    for (let i = 0; i < qty; i++) {
      addToCart({ ...product, variant } as any)
    }
    toast(
      <div className="flex items-center gap-3 py-1">
        <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined text-black text-[16px] font-bold">check</span>
        </div>
        <span className="text-white text-[14px] font-semibold tracking-wide">Añadido al carrito</span>
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

  function handleWhatsApp() {
    const num = whatsappNumber || '595981123456'
    const cleanNum = num.replace(/\D/g, '')
    const message = `¡Hola Adonis! Me interesa este producto: ${product.name}${selectedSize ? ` (Talla: ${selectedSize})` : ''}. ¿Tienen disponibilidad?`
    const url = `https://wa.me/${cleanNum}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Size Selector (if exists) */}
      {availableSizes.length > 0 && (
        <div className="space-y-3">
          <p className="text-[11px] text-neutral-400 uppercase tracking-widest font-bold">Talla</p>
          <div className="flex flex-wrap gap-2">
            {availableSizes.map(size => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`min-w-[50px] h-10 px-4 flex items-center justify-center rounded-full border text-[12px] font-bold transition-all ${
                  selectedSize === size
                    ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
                    : 'bg-transparent text-neutral-800 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:border-black dark:hover:border-white'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quantity Selector */}
      <div className="space-y-3">
        <p className="text-[11px] text-neutral-400 uppercase tracking-widest font-bold">Cantidad</p>
        <div className="flex items-center border border-neutral-200 dark:border-neutral-700 w-fit h-12 rounded-sm overflow-hidden">
          <button 
            onClick={() => setQty(Math.max(1, qty - 1))}
            className="w-12 h-full flex items-center justify-center text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">remove</span>
          </button>
          <span className="w-10 text-center text-sm font-bold text-black tabular-nums">{qty}</span>
          <button 
            onClick={() => setQty(qty + 1)}
            className="w-12 h-full flex items-center justify-center text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 mt-4 font-sans">
        {/* WhatsApp Button (Green) */}
        <button 
          onClick={handleWhatsApp}
          className="w-full bg-[#25D366] text-white py-4 rounded-lg text-[13px] uppercase tracking-[0.1em] font-black hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(37,211,102,0.3)]"
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.484 8.412-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.309 1.656zm6.29-4.171c1.589.943 3.191 1.441 4.935 1.441 5.393 0 9.778-4.385 9.778-9.777 0-2.612-1.017-5.068-2.864-6.916-1.848-1.847-4.304-2.864-6.915-2.864-5.393 0-9.778 4.385-9.778 9.778 0 1.834.504 3.535 1.458 4.924l-.991 3.611 3.308-.867zm11.367-7.277c-.313-.156-1.853-.914-2.14-.1.02-.286-.126-.43-.126-1.258-.286-1.631-.63-1.918-.745-.315-.115-.658-.115-1.003 0-.086.028-.172.057-.258.115-.315.229-1.318 1.289-1.318 3.15 0 1.861 1.346 3.665 1.532 3.922.186.257 2.651 4.047 6.422 5.675.897.387 1.597.618 2.141.792.901.286 1.722.245 2.37.15.722-.105 1.853-.756 2.115-1.45.26-.693.26-1.289.183-1.423-.077-.134-.286-.213-.599-.37z"/>
          </svg>
          Comprar por WhatsApp
        </button>

        <button 
          onClick={handleAdd}
          className="w-full border border-neutral-800 dark:border-neutral-700 text-black py-4 rounded-lg text-[13px] uppercase tracking-[0.1em] font-bold hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all mt-1"
        >
          Agregar al carrito
        </button>
      </div>
    </div>
  )
}

