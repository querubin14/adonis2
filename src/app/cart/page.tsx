import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { MOCK_PRODUCTS, formatPrice } from '@/lib/data'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Archivo de Colección | ADONIS',
  description: 'Sus piezas seleccionadas.',
}

export default function CartPage() {
  const cartItems = [MOCK_PRODUCTS[0], MOCK_PRODUCTS[1]]
  const total = cartItems.reduce((sum, p) => sum + p.price, 0)

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background text-on-background pt-32 pb-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <header className="mb-16 border-b border-outline-variant/20 pb-12">
            <h1 className="font-headline text-5xl md:text-6xl text-white uppercase tracking-tight">Su Colección</h1>
            <p className="text-secondary mt-4 font-body font-light">{cartItems.length} Piezas reservadas</p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-20">
            <div className="lg:col-span-2 space-y-12">
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-8 group pb-12 border-b border-outline-variant/10">
                  <div className="w-32 h-40 bg-surface flex-shrink-0 relative overflow-hidden">
                    <div className="w-full h-full bg-neutral-800 opacity-20 absolute inset-0" />
                  </div>
                  <div className="flex-grow flex flex-col justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-neutral-500 mb-2 font-bold">{item.category}</p>
                      <h3 className="font-headline text-2xl text-white group-hover:text-primary transition-colors uppercase tracking-tight">{item.name}</h3>
                      <p className="text-sm text-neutral-500 font-body mt-2 font-light">{item.material}</p>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <p className="font-sans text-lg text-primary-container font-light">{formatPrice(item.price)}</p>
                      <button className="text-[10px] uppercase tracking-widest text-neutral-600 hover:text-error transition-colors font-bold">Liberar Pieza</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <aside className="bg-surface-container-low p-12 h-fit space-y-8 sticky top-32">
              <h2 className="font-headline text-2xl text-white uppercase tracking-tight">Resumen</h2>
              <div className="space-y-4 border-b border-outline-variant/20 pb-8">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500 uppercase tracking-widest text-[10px] font-bold">Subtotal</span>
                  <span className="text-white font-sans font-light">{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500 uppercase tracking-widest text-[10px] font-bold">Impuestos de Estado</span>
                  <span className="text-white font-sans font-light italic">Calculados en el pago</span>
                </div>
              </div>
              <div className="flex justify-between items-baseline">
                 <span className="font-headline text-lg text-secondary uppercase tracking-widest">Total de Archivos</span>
                 <span className="font-headline text-3xl text-white">{formatPrice(total)}</span>
              </div>
              <Link href="/checkout" className="block w-full bg-primary text-on-primary text-center py-6 font-label uppercase tracking-widest text-xs hover:bg-neutral-200 transition-all font-bold">
                Proceder al Pago
              </Link>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
