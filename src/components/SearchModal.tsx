'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { getProducts, formatPrice } from '@/lib/data'
import { Product } from '@/lib/types'

interface Props { isOpen: boolean; onClose: () => void }

export default function SearchModal({ isOpen, onClose }: Props) {
  const [query, setQuery] = useState('')
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [loaded, setLoaded] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Load products on first open
  const load = useCallback(async () => {
    if (loaded) return
    try {
      const prods = await getProducts()
      setAllProducts(prods)
      setLoaded(true)
    } catch (e) { console.error(e) }
  }, [loaded])

  useEffect(() => {
    if (isOpen) {
      load()
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      setQuery('')
    }
  }, [isOpen, load])

  // Keyboard close
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    if (isOpen) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  // Filter after 3+ characters
  const results = query.trim().length >= 3
    ? allProducts.filter(p => {
        const q = query.toLowerCase()
        return (
          p.name.toLowerCase().includes(q) ||
          (p.material ?? '').toLowerCase().includes(q) ||
          (p.description ?? '').toLowerCase().includes(q)
        )
      }).slice(0, 15)
    : []

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[200] bg-white/85 backdrop-blur-md flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label="Buscar productos"
    >
      {/* Search input bar */}
      <div className="border-b border-neutral-200 bg-white">
        <div className="max-w-3xl mx-auto px-6 flex items-center gap-4 py-5">
          <span className="material-symbols-outlined text-neutral-500 text-xl" aria-hidden="true">search</span>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar piezas, materiales..."
            className="flex-grow bg-transparent text-black text-base outline-none placeholder:text-neutral-400"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-neutral-500 hover:text-black transition-colors" aria-label="Limpiar">
              <span className="material-symbols-outlined text-base" aria-hidden="true">close</span>
            </button>
          )}
          <button onClick={onClose}
            className="text-[9px] uppercase tracking-widest text-neutral-500 hover:text-black transition-colors font-bold border border-neutral-300 hover:border-black px-3 py-1.5 ml-2">
            ESC
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="flex-grow overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-8">
          {query.trim().length > 0 && query.trim().length < 3 && (
            <p className="text-[9px] text-neutral-600 uppercase tracking-widest font-bold text-center">
              Escribe al menos 3 caracteres...
            </p>
          )}

          {query.trim().length >= 3 && results.length === 0 && (
            <div className="text-center py-16">
              <span className="material-symbols-outlined text-4xl text-neutral-200 block mb-3" aria-hidden="true">search_off</span>
              <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">
                Sin resultados para "{query}"
              </p>
            </div>
          )}

          {results.length > 0 && (
            <>
              <p className="text-[8px] uppercase tracking-[0.35em] text-neutral-600 font-bold mb-5">
                {results.length} resultado{results.length !== 1 ? 's' : ''} para "{query}"
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {results.map(p => (
                  <Link
                    key={p.id}
                    href={`/products/${p.slug}`}
                    onClick={onClose}
                    className="group flex flex-col bg-neutral-50 border border-neutral-200 hover:border-black transition-all overflow-hidden"
                  >
                    <div className="aspect-square bg-white overflow-hidden border-b border-neutral-100">
                      {p.images?.[0]
                        ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        : <div className="w-full h-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-3xl text-neutral-200" aria-hidden="true">diamond</span>
                          </div>
                      }
                    </div>
                    <div className="p-3">
                      <p className="font-headline text-xs text-black uppercase tracking-wide leading-tight line-clamp-2">{p.name}</p>
                      {p.material && <p className="text-[8px] text-neutral-500 mt-0.5 uppercase tracking-wider truncate">{p.material}</p>}
                      <p className="text-xs text-neutral-700 mt-1.5 tabular-nums font-bold">{formatPrice(p.price)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}


          {!query && (
            <div className="text-center py-16">
              <span className="material-symbols-outlined text-5xl text-neutral-800 block mb-4" aria-hidden="true">diamond</span>
              <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">
                Busca por nombre, material o descripción
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
