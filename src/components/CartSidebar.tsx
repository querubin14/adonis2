'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { useCart } from '@/context/CartContext'
import { formatPrice } from '@/lib/data'

type Step = 'cart' | 'checkout' | 'success'

interface Location { lat: number; lng: number; address: string }

export default function CartSidebar() {
  const { items, count, total, isOpen, remove, update, clear, close } = useCart()
  const router = useRouter()
  const [step, setStep] = useState<Step>('cart')

  function goToProducts() {
    close()
    // defer push so the sidebar unmounts cleanly before navigation
    setTimeout(() => router.push('/products'), 0)
  }
  const [form, setForm] = useState({ nombre: '', apellido: '', telefono: '' })
  const [location, setLocation] = useState<Location | null>(null)
  const [locLoading, setLocLoading] = useState(false)
  const [locError, setLocError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function getLocation() {
    if (!navigator.geolocation) { setLocError('Tu navegador no soporta geolocalización.'); return }
    setLocLoading(true); setLocError('')
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords
        let address = `${lat.toFixed(5)}, ${lng.toFixed(5)}`
        try {
          const r = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
            { headers: { 'Accept-Language': 'es' } }
          )
          const d = await r.json()
          if (d.display_name) address = d.display_name
        } catch {}
        setLocation({ lat, lng, address })
        setLocLoading(false)
      },
      () => { setLocError('No se pudo obtener tu ubicación. Verifica los permisos.'); setLocLoading(false) }
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    // Simulate a small delay (in a real app, POST to an API / WhatsApp)
    await new Promise(r => setTimeout(r, 800))
    setSubmitting(false)
    setStep('success')
    clear()
  }

  function reset() {
    setStep('cart')
    setForm({ nombre: '', apellido: '', telefono: '' })
    setLocation(null)
    setLocError('')
    close()
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={close}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className="fixed right-0 top-0 h-full w-full max-w-md z-50 bg-[#131313] border-l border-neutral-800 flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-label="Carrito de compras"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-800">
          {step === 'cart' && (
            <div>
              <h2 className="font-headline text-sm uppercase tracking-[0.25em] text-white">Carrito</h2>
              <p className="text-[9px] text-neutral-500 uppercase tracking-widest mt-0.5">{count} pieza{count !== 1 ? 's' : ''}</p>
            </div>
          )}
          {step === 'checkout' && (
            <div className="flex items-center gap-3">
              <button onClick={() => setStep('cart')} className="text-neutral-400 hover:text-white transition-colors">
                <span className="material-symbols-outlined text-base" aria-hidden="true">arrow_back</span>
              </button>
              <div>
                <h2 className="font-headline text-sm uppercase tracking-[0.25em] text-white">Finalizar Pedido</h2>
                <p className="text-[9px] text-neutral-500 uppercase tracking-widest mt-0.5">Tus datos de entrega</p>
              </div>
            </div>
          )}
          {step === 'success' && (
            <h2 className="font-headline text-sm uppercase tracking-[0.25em] text-white">Pedido Recibido</h2>
          )}
          <button onClick={close} aria-label="Cerrar carrito"
            className="p-1.5 text-neutral-400 hover:text-white transition-colors">
            <span className="material-symbols-outlined text-base" aria-hidden="true">close</span>
          </button>
        </div>

        {/* ── CART STEP ── */}
        {step === 'cart' && (
          <>
            <div className="flex-grow overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-5 p-8">
                  <span className="material-symbols-outlined text-5xl text-neutral-800" aria-hidden="true">shopping_bag</span>
                  <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold text-center">Tu carrito está vacío</p>
                  <button
                    onClick={goToProducts}
                    className="flex items-center gap-2 px-8 py-3 bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-200 transition-all"
                  >
                    <span className="material-symbols-outlined text-sm" aria-hidden="true">explore</span>
                    Empezar a comprar
                  </button>
                </div>
              ) : (
                <ul className="divide-y divide-neutral-800">
                  {items.map(({ product: p, quantity }) => (
                    <li key={p.id} className="flex gap-4 px-6 py-5">
                      {/* Image */}
                      <div className="w-16 h-20 bg-neutral-900 border border-neutral-800 flex-shrink-0 overflow-hidden">
                        {p.images?.[0]
                          ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                          : <span className="w-full h-full flex items-center justify-center material-symbols-outlined text-neutral-700 text-xl">diamond</span>
                        }
                      </div>
                      {/* Info */}
                      <div className="flex-grow min-w-0">
                        <p className="font-headline text-xs text-white uppercase tracking-wide leading-tight truncate">{p.name}</p>
                        {p.material && <p className="text-[9px] text-neutral-500 mt-0.5 uppercase tracking-wider">{p.material}</p>}
                        <p className="text-xs text-white mt-1.5 tabular-nums">{formatPrice(p.price * quantity)}</p>
                        {/* Qty controls */}
                        <div className="flex items-center gap-2 mt-2">
                          <button onClick={() => update(p.id, quantity - 1)}
                            className="w-6 h-6 border border-neutral-700 text-neutral-400 hover:text-white hover:border-white transition-all flex items-center justify-center text-sm">−</button>
                          <span className="text-xs text-white tabular-nums w-4 text-center">{quantity}</span>
                          <button onClick={() => update(p.id, quantity + 1)}
                            className="w-6 h-6 border border-neutral-700 text-neutral-400 hover:text-white hover:border-white transition-all flex items-center justify-center text-sm">+</button>
                          <button
                            onClick={() => {
                              remove(p.id)
                              toast(`${p.name} eliminado del carrito`, {
                                position: 'top-center',
                                autoClose: 3000,
                                hideProgressBar: true,
                                closeButton: false,
                                theme: 'dark',
                              })
                            }}
                            aria-label="Eliminar"
                            className="ml-auto text-neutral-600 hover:text-error transition-colors">
                            <span className="material-symbols-outlined text-sm" aria-hidden="true">delete</span>
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-neutral-800 p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold">Subtotal</span>
                  <span className="text-sm text-white font-bold tabular-nums">{formatPrice(total)}</span>
                </div>
                <p className="text-[8px] text-neutral-600 leading-relaxed">Envío y costo final se coordinan tras confirmar el pedido.</p>
                <button
                  onClick={() => setStep('checkout')}
                  className="w-full bg-white text-black py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-200 transition-all"
                >
                  Finalizar Compra
                </button>
                <button
                  onClick={close}
                  className="w-full flex items-center justify-center gap-2 border border-neutral-700 text-neutral-400 py-3.5 text-[10px] font-bold uppercase tracking-widest hover:text-white hover:border-white transition-all"
                >
                  <span className="material-symbols-outlined text-sm" aria-hidden="true">arrow_back</span>
                  Seguir Comprando
                </button>
              </div>
            )}
          </>
        )}

        {/* ── CHECKOUT STEP ── */}
        {step === 'checkout' && (
          <form onSubmit={handleSubmit} className="flex-grow flex flex-col overflow-y-auto">
            <div className="flex-grow p-6 space-y-5">
              {/* Name fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] tracking-[0.2em] text-neutral-500 uppercase mb-2 font-bold">
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <input name="nombre" value={form.nombre} onChange={handleInput} required placeholder="Tu nombre"
                    className="w-full bg-transparent border-b border-neutral-700 text-white text-sm py-2 outline-none focus:border-white transition-colors placeholder:text-neutral-700" />
                </div>
                <div>
                  <label className="block text-[9px] tracking-[0.2em] text-neutral-500 uppercase mb-2 font-bold">
                    Apellido <span className="text-red-500">*</span>
                  </label>
                  <input name="apellido" value={form.apellido} onChange={handleInput} required placeholder="Tu apellido"
                    className="w-full bg-transparent border-b border-neutral-700 text-white text-sm py-2 outline-none focus:border-white transition-colors placeholder:text-neutral-700" />
                </div>
              </div>

              <div>
                <label className="block text-[9px] tracking-[0.2em] text-neutral-500 uppercase mb-2 font-bold">Teléfono</label>
                <input name="telefono" value={form.telefono} onChange={handleInput} placeholder="+595 9xx xxx xxx" type="tel"
                  className="w-full bg-transparent border-b border-neutral-700 text-white text-sm py-2 outline-none focus:border-white transition-colors placeholder:text-neutral-700" />
              </div>

              {/* Location */}
              <div>
                <label className="block text-[9px] tracking-[0.2em] text-neutral-500 uppercase mb-2 font-bold">
                  Ubicación de entrega <span className="text-red-500">*</span>
                </label>

                {!location ? (
                  <div className="space-y-3">
                    <button type="button" onClick={getLocation} disabled={locLoading}
                      className="w-full border border-neutral-700 hover:border-white text-neutral-400 hover:text-white py-3 text-[9px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                      {locLoading ? (
                        <span className="w-3.5 h-3.5 border-2 border-neutral-600 border-t-white rounded-full animate-spin" />
                      ) : (
                        <span className="material-symbols-outlined text-sm" aria-hidden="true">my_location</span>
                      )}
                      {locLoading ? 'Obteniendo ubicación...' : 'Marcar mi ubicación en mapa'}
                    </button>
                    {locError && <p className="text-[9px] text-red-400">{locError}</p>}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Map embed */}
                    <div className="relative overflow-hidden border border-neutral-800" style={{ height: 180 }}>
                      <iframe
                        title="Mapa de entrega"
                        src={`https://www.google.com/maps?q=${location.lat},${location.lng}&z=15&output=embed`}
                        className="w-full h-full border-0"
                        loading="lazy"
                      />
                    </div>
                    {/* Address */}
                    <p className="text-[9px] text-neutral-300 leading-relaxed">{location.address}</p>
                    <button type="button" onClick={() => setLocation(null)}
                      className="text-[9px] text-neutral-500 hover:text-white underline underline-offset-2 transition-colors uppercase tracking-wider font-bold">
                      Cambiar ubicación
                    </button>
                  </div>
                )}
              </div>

              {/* Order summary */}
              <div className="bg-neutral-900 border border-neutral-800 p-4 space-y-2">
                <p className="text-[8px] uppercase tracking-widest text-neutral-500 font-bold mb-3">Resumen</p>
                {items.map(({ product: p, quantity }) => (
                  <div key={p.id} className="flex justify-between text-[9px]">
                    <span className="text-neutral-400 truncate max-w-[60%]">{quantity}× {p.name}</span>
                    <span className="text-neutral-300 tabular-nums">{formatPrice(p.price * quantity)}</span>
                  </div>
                ))}
                <div className="flex justify-between text-[10px] font-bold pt-2 border-t border-neutral-800 mt-2">
                  <span className="text-neutral-400 uppercase tracking-wider">Total</span>
                  <span className="text-white tabular-nums">{formatPrice(total)}</span>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-neutral-800">
              <button type="submit" disabled={submitting || !location}
                className="w-full bg-white text-black py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-200 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {submitting && <span className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />}
                {submitting ? 'Enviando pedido...' : 'Confirmar Pedido'}
              </button>
              {!location && (
                <p className="text-[8px] text-neutral-600 text-center mt-2">Debes marcar tu ubicación antes de confirmar</p>
              )}
            </div>
          </form>
        )}

        {/* ── SUCCESS STEP ── */}
        {step === 'success' && (
          <div className="flex-grow flex flex-col items-center justify-center p-8 text-center gap-5">
            <div className="w-16 h-16 bg-emerald-900/30 border border-emerald-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl text-emerald-400" aria-hidden="true">check_circle</span>
            </div>
            <div>
              <h3 className="font-headline text-lg uppercase tracking-widest text-white mb-2">¡Pedido Recibido!</h3>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Gracias, <span className="text-white">{form.nombre}</span>. Nos pondremos en contacto contigo pronto para coordinar la entrega.
              </p>
            </div>
            <button onClick={reset}
              className="mt-4 bg-white text-black px-8 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-200 transition-all">
              Seguir Comprando
            </button>
          </div>
        )}
      </aside>
    </>
  )
}
