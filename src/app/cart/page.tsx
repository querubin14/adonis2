'use client'

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { formatPrice } from '@/lib/data'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'

export default function CartPage() {
  const { items, total, remove, update } = useCart()

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background text-on-background pt-32 pb-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <header className="mb-16 border-b border-outline-variant/20 pb-12">
            <h1 className="font-headline text-5xl md:text-6xl text-white uppercase tracking-tight">Su Colección</h1>
            <p className="text-secondary mt-4 font-body font-light">{items.length} Piezas seleccionadas</p>
          </header>

          {items.length === 0 ? (
            <div className="flex flex-col items-center py-20 gap-6">
              <span className="material-symbols-outlined text-6xl text-neutral-800" aria-hidden="true">shopping_bag</span>
              <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">Su colección está vacía</p>
              <Link href="/products" className="px-8 py-3 bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-200 transition-all">
                Explorar Piezas
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-20">
              <div className="lg:col-span-2 space-y-12">
                {items.map(({ product: item, quantity }) => (
                  <div key={item.id} className="flex gap-8 group pb-12 border-b border-outline-variant/10">
                    <div className="w-32 h-40 bg-surface-container-low flex-shrink-0 relative overflow-hidden border border-outline-variant/5">
                      {item.images?.[0] ? (
                        <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-2xl text-neutral-800" aria-hidden="true">diamond</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-grow flex flex-col justify-between">
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-neutral-500 mb-2 font-bold">{item.material || 'Alta Joyería'}</p>
                        <h3 className="font-headline text-2xl text-white group-hover:text-primary transition-colors uppercase tracking-tight">{item.name}</h3>
                        <div className="flex items-center gap-4 mt-4">
                          <div className="flex items-center border border-neutral-800">
                             <button onClick={() => update(item.id, quantity - 1)} className="px-3 py-1 text-neutral-500 hover:text-white transition-colors">-</button>
                             <span className="px-2 text-xs text-white font-sans">{quantity}</span>
                             <button onClick={() => update(item.id, quantity + 1)} className="px-3 py-1 text-neutral-500 hover:text-white transition-colors">+</button>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between items-baseline mt-4">
                        <p className="font-sans text-lg text-primary-container font-light">{formatPrice(item.price * quantity)}</p>
                        <button onClick={() => remove(item.id)} className="text-[10px] uppercase tracking-widest text-neutral-600 hover:text-error transition-colors font-bold">Liberar Pieza</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <aside className="bg-surface-container-low p-12 h-fit space-y-8 sticky top-32 border border-outline-variant/5">
                <h2 className="font-headline text-2xl text-white uppercase tracking-tight">Resumen</h2>
                <div className="space-y-4 border-b border-outline-variant/20 pb-8">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-500 uppercase tracking-widest text-[10px] font-bold">Subtotal</span>
                    <span className="text-white font-sans font-light">{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-500 uppercase tracking-widest text-[10px] font-bold">Establecimiento</span>
                    <span className="text-white font-sans font-light italic">Asunción, PY</span>
                  </div>
                </div>
                <div className="flex justify-between items-baseline">
                   <span className="font-headline text-lg text-secondary uppercase tracking-widest">Total Estimado</span>
                   <span className="font-headline text-3xl text-white">{formatPrice(total)}</span>
                </div>
                <Link href="/checkout" className="block w-full bg-primary text-on-primary text-center py-6 font-label uppercase tracking-widest text-xs hover:bg-neutral-200 transition-all font-bold">
                  Proceder al Pago
                </Link>
              </aside>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}

