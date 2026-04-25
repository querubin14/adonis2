'use client'

import { useCart } from '@/context/CartContext'
import { useState, useEffect } from 'react'

export default function FloatingCartButton() {
  const { count, open } = useCart()
  const [show, setShow] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShow(window.scrollY > 200)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (count === 0) return null

  return (
    <div className={`fixed bottom-24 right-6 z-[45] transition-all duration-500 md:hidden ${show ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
      <button
        onClick={open}
        className="w-14 h-14 bg-white text-black rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-neutral-200 flex items-center justify-center relative active:scale-95 transition-transform"
        aria-label="Ver carrito"
      >
        <span className="material-symbols-outlined text-2xl">shopping_bag</span>
        <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] w-5 h-5 flex items-center justify-center font-bold rounded-full border-2 border-white">
          {count}
        </span>
      </button>
    </div>
  )
}
