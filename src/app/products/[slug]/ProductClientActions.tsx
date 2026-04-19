'use client'

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
      theme: 'dark',
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
    <div className="flex flex-col gap-6">
      {/* Quantity Selector */}
      <div className="space-y-3">
        <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">Cantidad</p>
        <div className="flex items-center border border-neutral-800 w-fit">
          <button 
            onClick={() => setQty(Math.max(1, qty - 1))}
            className="w-10 h-10 flex items-center justify-center text-neutral-400 hover:text-white transition-colors border-r border-neutral-800"
          >
            <span className="material-symbols-outlined text-sm">remove</span>
          </button>
          <span className="w-12 text-center text-xs text-white font-medium">{qty}</span>
          <button 
            onClick={() => setQty(qty + 1)}
            className="w-10 h-10 flex items-center justify-center text-neutral-400 hover:text-white transition-colors border-l border-neutral-800"
          >
            <span className="material-symbols-outlined text-sm">add</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {/* Buttons matching screenshot style */}
        <div className="flex gap-3">
          <button 
            onClick={handleAdd}
            className="flex-grow border border-white text-white py-4 font-label uppercase tracking-widest text-[10px] font-bold hover:bg-white hover:text-black transition-all flex items-center justify-center gap-3"
          >
            Agregar al carrito
          </button>
          <button 
            onClick={handleFavorite}
            aria-label={isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
            className={`px-5 border border-neutral-800 flex items-center justify-center hover:border-white transition-all ${isFavorite ? 'text-red-500' : 'text-neutral-500'}`}
          >
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: isFavorite ? "'FILL' 1" : "''" }}>
              favorite
            </span>
          </button>
        </div>
        
        <button 
          onClick={handleBuyNow}
          className="w-full bg-white text-black py-4 font-label uppercase tracking-widest text-[10px] font-extrabold hover:bg-neutral-200 transition-all text-center"
        >
          Comprar ahora
        </button>
      </div>
      
      <div className="flex flex-col gap-4">
        <a 
          href={`https://wa.me/595981000000?text=Hola, estoy interesado en la pieza: ${product.name} (Ref: ${product.id.slice(0,4)})`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full border-t border-neutral-800 pt-6 text-neutral-500 text-[9px] uppercase tracking-widest hover:text-white transition-all font-bold flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-sm text-[#25D366]">chat</span>
          Consultar por WhatsApp
        </a>
      </div>
    </div>
  )
}
