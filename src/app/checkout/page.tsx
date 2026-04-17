'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useCart } from '@/context/CartContext'
import { formatPrice } from '@/lib/data'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function CheckoutPage() {
  const { items, total, clear } = useCart()
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  async function handleConfirm() {
    if (items.length === 0) return
    setSubmitting(true)
    
    // Simulate order processing
    setTimeout(() => {
      setSubmitting(false)
      clear()
      toast.success('Pedido confirmado con éxito. Nos contactaremos pronto.', {
        position: 'top-center',
        theme: 'dark'
      })
      router.push('/')
    }, 2000)
  }

  if (items.length === 0 && !submitting) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-background text-on-background pt-32 pb-20 px-6 md:px-12 flex flex-col items-center justify-center gap-6">
          <h1 className="font-headline text-3xl text-white uppercase tracking-tight">Su colección está vacía</h1>
          <Link href="/products" className="px-8 py-3 bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-200 transition-all">
            Volver a la Galería
          </Link>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background text-on-background pt-32 pb-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <header className="mb-16 border-b border-outline-variant/20 pb-12">
            <h1 className="font-headline text-5xl md:text-6xl text-white uppercase tracking-tight">Finalizar Compromiso</h1>
            <p className="text-secondary mt-4 font-body font-light">Asegurando su selección de legado.</p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            <div className="space-y-16">
              {/* Form Section */}
              <section className="space-y-10">
                <h2 className="font-headline text-2xl text-white uppercase tracking-tight">Información del Cliente</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="flex flex-col gap-2">
                     <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-bold">Email de Procedencia</label>
                     <input type="email" className="bg-transparent border-0 border-b border-neutral-800 focus:border-white focus:ring-0 text-white font-sans py-4 px-0 transition-colors" placeholder="curador@ejemplo.com" />
                   </div>
                   <div className="flex flex-col gap-2">
                     <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-bold">Línea Directa</label>
                     <input type="tel" className="bg-transparent border-0 border-b border-neutral-800 focus:border-white focus:ring-0 text-white font-sans py-4 px-0 transition-colors" placeholder="+595 ..." />
                   </div>
                </div>
              </section>

              <section className="space-y-10">
                <h2 className="font-headline text-2xl text-white uppercase tracking-tight">Dirección de Registro</h2>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-bold">Nombre Completo</label>
                  <input type="text" className="bg-transparent border-0 border-b border-neutral-800 focus:border-white focus:ring-0 text-white font-sans py-4 px-0 transition-colors" placeholder="Elena Moretti" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-bold">Dirección de Entrega Segura</label>
                  <input type="text" className="bg-transparent border-0 border-b border-neutral-800 focus:border-white focus:ring-0 text-white font-sans py-4 px-0 transition-colors" placeholder="Calle, Ciudad, Departamento" />
                </div>
              </section>
            </div>

            <aside className="space-y-12">
              <div className="bg-surface-container-low p-12 border border-outline-variant/10">
                <h2 className="font-headline text-2xl text-white mb-8 uppercase tracking-tight">Resumen de Activos</h2>
                <div className="space-y-6 mb-8">
                  {items.map(({ product: item, quantity }) => (
                    <div key={item.id} className="flex justify-between items-center text-sm">
                      <span className="text-neutral-400 font-body font-light">{item.name} (x{quantity})</span>
                      <span className="text-white font-sans font-bold">{formatPrice(item.price * quantity)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center text-sm border-t border-outline-variant/10 pt-4">
                    <span className="text-neutral-400 font-body font-light">Seguro y Envío Especial</span>
                    <span className="text-white font-sans font-bold">Gs. 0</span>
                  </div>
                  <div className="pt-6 border-t border-outline-variant/20 flex justify-between items-baseline">
                    <span className="font-headline text-lg text-secondary uppercase tracking-widest">Compromiso Total</span>
                    <span className="font-headline text-3xl text-white">{formatPrice(total)}</span>
                  </div>
                </div>
                <button
                  onClick={handleConfirm}
                  disabled={submitting}
                  className="w-full bg-primary text-on-primary py-6 font-label uppercase tracking-widest text-xs hover:bg-neutral-200 transition-all font-bold disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting && <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />}
                  {submitting ? 'Confirmando...' : 'Confirmar Transacción'}
                </button>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
