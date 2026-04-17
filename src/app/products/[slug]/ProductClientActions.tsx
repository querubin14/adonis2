'use client'

import { useCart } from '@/context/CartContext'
import { useFavorites } from '@/hooks/useFavorites'
import { Product } from '@/lib/types'
import { toast } from 'react-toastify'

export default function ProductClientActions({ product }: { product: Product }) {
  const { add: addToCart, open: openCart } = useCart()
  const { toggle, ids } = useFavorites()
  const isFavorite = ids.includes(product.id)

  function handleAdd() {
    addToCart(product)
    toast.success(`${product.name} añadido a su colección`, {
      position: 'top-center',
      theme: 'dark',
      icon: false,
    })
    openCart()
  }

  function handleFavorite() {
    toggle(product.id)
    toast(isFavorite ? 'Eliminado de favoritos' : 'Añadido a favoritos', {
      position: 'top-center',
      theme: 'dark',
      autoClose: 2000,
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-3">
        <button 
          onClick={handleAdd}
          className="flex-grow bg-white text-black py-5 font-label uppercase tracking-widest text-[10px] font-bold hover:bg-neutral-200 transition-all flex items-center justify-center gap-3"
        >
          <span className="material-symbols-outlined text-base">shopping_bag</span>
          Añadir a la Selección
        </button>
        <button 
          onClick={handleFavorite}
          aria-label={isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
          className={`px-6 border border-outline-variant/30 flex items-center justify-center hover:border-white transition-all ${isFavorite ? 'text-red-500 border-red-500/30' : 'text-neutral-500'}`}
        >
          <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: isFavorite ? "'FILL' 1" : "''" }}>
            favorite
          </span>
        </button>
      </div>
      
      <a 
        href={`https://wa.me/595981000000?text=Hola, estoy interesado en la pieza: ${product.name} (Ref: ${product.id.slice(0,4)})`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full border border-neutral-800 text-neutral-400 py-5 font-label uppercase tracking-widest text-[10px] hover:border-white hover:text-white transition-all font-bold text-center flex items-center justify-center gap-3"
      >
        <span className="material-symbols-outlined text-base">contact_support</span>
        Consultar con un Asesor
      </a>
    </div>
  )
}
