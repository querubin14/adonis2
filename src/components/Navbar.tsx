'use client'

import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-neutral-950/60 backdrop-blur-xl flex justify-between items-center px-6 md:px-12 py-6">
      <Link href="/" className="text-2xl font-serif tracking-[0.3em] text-white">
        ADONIS
      </Link>
      
      <div className="hidden md:flex gap-10">
        <Link 
          href="/products" 
          className="font-headline tracking-[0.2em] uppercase text-xs text-white border-b border-white/40 pb-1 hover:text-white transition-colors duration-500 font-bold"
        >
          Colecciones
        </Link>
        <Link 
          href="/products" 
          className="font-headline tracking-[0.2em] uppercase text-xs text-neutral-400 hover:text-white transition-colors duration-500 font-bold"
        >
          Alta Joyería
        </Link>
        <Link 
          href="/products" 
          className="font-headline tracking-[0.2em] uppercase text-xs text-neutral-400 hover:text-white transition-colors duration-500 font-bold"
        >
          El Archivo
        </Link>
        <Link 
          href="/admin" 
          className="font-headline tracking-[0.2em] uppercase text-xs text-neutral-400 hover:text-white transition-colors duration-500 font-bold"
        >
          Panel Admin
        </Link>
      </div>

      <div className="flex items-center gap-6">
        <button className="material-symbols-outlined text-white text-2xl">
          search
        </button>
        <button className="material-symbols-outlined text-white text-2xl relative">
          shopping_bag
          <span className="absolute -top-1 -right-1 bg-white text-black text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
            2
          </span>
        </button>
      </div>
    </nav>
  )
}
