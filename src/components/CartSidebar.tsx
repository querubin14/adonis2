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
      () => { 
        setLocError('No se pudo obtener tu ubicación automáticamente. Por favor, ingresa tu dirección manualmente.'); 
        setLocLoading(false);
      }
    )
  }

  function setManualAddress(address: string) {
    if (!address) return
    // Default to a central point if we don't have coords, or just show the address
    setLocation({ lat: -25.2865, lng: -57.6470, address }) 
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
        className="fixed right-0 top-0 h-full w-full max-w-md z-50 bg-white border-l border-neutral-200 flex flex-col shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Carrito de compras"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-6 border-b border-neutral-100">
          {step === 'cart' && (
            <h2 className="font-headline text-[15px] uppercase tracking-wide text-black font-black">
              CARRITO ({count})
            </h2>
          )}
          {step === 'checkout' && (
            <div className="flex items-center gap-3">
              <button onClick={() => setStep('cart')} className="text-neutral-500 hover:text-black transition-colors">
                <span className="material-symbols-outlined text-xl" aria-hidden="true">arrow_back</span>
              </button>
              <h2 className="font-headline text-[15px] uppercase tracking-wide text-black font-black">DATOS DE ENVÍO</h2>
            </div>
          )}
          {step === 'success' && (
            <h2 className="font-headline text-[15px] uppercase tracking-wide text-black font-black">PEDIDO RECIBIDO</h2>
          )}
          <button onClick={close} aria-label="Cerrar carrito"
            className="p-1 text-neutral-400 hover:text-black transition-colors">
            <span className="material-symbols-outlined text-xl" aria-hidden="true">close</span>
          </button>
        </div>

        {/* ── CART STEP ── */}
        {step === 'cart' && (
          <>
            <div className="flex-grow overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-5 p-8">
                  <span className="material-symbols-outlined text-5xl text-neutral-200" aria-hidden="true">shopping_bag</span>
                  <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold text-center">Tu carrito está vacío</p>
                  <button
                    onClick={goToProducts}
                    className="flex items-center gap-2 px-8 py-3 bg-black text-white text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-800 transition-all"
                  >
                    <span className="material-symbols-outlined text-sm" aria-hidden="true">explore</span>
                    Empezar a comprar
                  </button>
                </div>
              ) : (
                <ul className="p-4 space-y-4">
                  {items.map(({ product: p, quantity }) => (
                    <li key={p.id} className="relative flex gap-4 p-4 rounded-xl border border-neutral-100 bg-neutral-50/50">
                      {/* Image */}
                      <div className="w-[72px] h-[72px] rounded-lg bg-white border border-neutral-100 flex-shrink-0 overflow-hidden">
                        {p.images?.[0]
                          ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                          : <span className="w-full h-full flex items-center justify-center material-symbols-outlined text-neutral-300 text-xl">diamond</span>
                        }
                      </div>
                      
                      {/* Delete button (top right) */}
                      <button
                        onClick={() => {
                          remove(p.id)
                          toast(`${p.name} eliminado del carrito`, {
                            position: 'top-center',
                            autoClose: 3000,
                            hideProgressBar: true,
                            closeButton: false,
                            theme: 'light',
                          })
                        }}
                        aria-label="Eliminar"
                        className="absolute top-4 right-4 text-neutral-400 hover:text-black transition-colors">
                        <span className="material-symbols-outlined text-[18px]" aria-hidden="true">delete</span>
                      </button>

                      {/* Info */}
                      <div className="flex-grow flex flex-col pt-0.5 pr-6">
                        <p className="font-headline text-[13px] text-black font-black leading-tight pr-2">{p.name}</p>
                        <p className="text-[9px] text-neutral-500 mt-1 uppercase tracking-wider font-bold">
                          {typeof p.category === 'string' ? p.category : p.category || 'PRODUCTOS'}
                        </p>
                        
                        {/* Variant Select / Mock Select */}
                        <div className="mt-3 flex items-center justify-between border border-neutral-200 rounded px-3 py-1.5 bg-white">
                          <span className="text-[11px] text-black">Único</span>
                          <span className="material-symbols-outlined text-[14px] text-neutral-400">expand_more</span>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          <p className="text-[13px] text-black font-bold tabular-nums tracking-wide">{formatPrice(p.price)}</p>
                          
                          {/* Qty controls */}
                          <div className="flex items-center border border-neutral-200 rounded-md bg-white">
                            <button onClick={() => update(p.id, Math.max(1, quantity - 1))}
                              className="w-7 h-7 text-neutral-400 hover:text-black transition-all flex items-center justify-center text-sm font-bold pb-0.5">−</button>
                            <span className="text-[11px] text-black tabular-nums w-4 text-center font-bold">{quantity}</span>
                            <button onClick={() => update(p.id, quantity + 1)}
                              className="w-7 h-7 text-neutral-400 hover:text-black transition-all flex items-center justify-center text-sm font-bold pb-0.5">+</button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-neutral-100 p-6 pt-5 bg-white">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-[13px] uppercase tracking-widest text-black font-black">SUBTOTAL</span>
                  <span className="text-lg text-black font-bold tabular-nums">{formatPrice(total)}</span>
                </div>
                
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => setStep('checkout')}
                    className="w-full bg-black text-white py-4 text-[12px] font-black uppercase tracking-widest hover:bg-neutral-800 transition-all rounded-sm"
                  >
                    CONTINUAR COMPRA
                  </button>
                  <button
                    onClick={close}
                    className="w-full bg-white border border-neutral-200 text-neutral-600 py-3.5 text-[11px] font-bold uppercase tracking-widest hover:text-black hover:border-black transition-all rounded-sm"
                  >
                    SEGUIR COMPRANDO
                  </button>
                </div>
              </div>
            )}
          </>
        )}


        {/* ── CHECKOUT STEP ── */}
        {step === 'checkout' && (
          <form onSubmit={handleSubmit} className="flex-grow flex flex-col overflow-y-auto">
            <div className="flex-grow p-6 space-y-8">
              
              {/* Client Data */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-neutral-400 text-[18px]">person</span>
                  <h3 className="text-[11px] font-black tracking-[0.1em] text-neutral-400 uppercase">Datos del cliente</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] tracking-wide text-neutral-500 font-bold mb-2 uppercase">
                      Nombre *
                    </label>
                    <input name="nombre" value={form.nombre} onChange={handleInput} required placeholder="Tu nombre"
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-md text-black text-sm py-3 px-4 outline-none focus:border-black transition-colors placeholder:text-neutral-400" />
                  </div>
                  <div>
                    <label className="block text-[10px] tracking-wide text-neutral-500 font-bold mb-2 uppercase">
                      Apellido *
                    </label>
                    <input name="apellido" value={form.apellido} onChange={handleInput} required placeholder="Tu apellido"
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-md text-black text-sm py-3 px-4 outline-none focus:border-black transition-colors placeholder:text-neutral-400" />
                  </div>
                  <div>
                    <label className="block text-[10px] tracking-wide text-neutral-500 font-bold mb-2 uppercase">
                      Teléfono
                    </label>
                    <input name="telefono" value={form.telefono} onChange={handleInput} placeholder="+595 9xx xxx xxx" type="tel"
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-md text-black text-sm py-3 px-4 outline-none focus:border-black transition-colors placeholder:text-neutral-400" />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-neutral-400 text-[18px]">location_on</span>
                  <h3 className="text-[11px] font-black tracking-[0.1em] text-neutral-400 uppercase">Ubicación de envío</h3>
                </div>

                {!location ? (
                  <div className="space-y-3">
                    <button type="button" onClick={getLocation} disabled={locLoading}
                      className="w-full border border-dashed border-neutral-300 bg-neutral-50 hover:border-neutral-500 rounded-xl py-6 flex flex-col items-center justify-center gap-3 transition-all disabled:opacity-50">
                      <div className="w-12 h-12 rounded-full border border-neutral-200 flex items-center justify-center bg-white">
                        {locLoading ? (
                          <span className="w-5 h-5 border-2 border-neutral-200 border-t-black rounded-full animate-spin" />
                        ) : (
                          <span className="material-symbols-outlined text-black text-xl" aria-hidden="true">map</span>
                        )}
                      </div>
                      <div className="text-center">
                        <span className="block text-[11px] font-black text-black uppercase tracking-widest mb-1">
                          {locLoading ? 'Obteniendo ubicación...' : 'Marcar en el mapa'}
                        </span>
                        <span className="block text-[9px] text-neutral-500">Requerido para calcular envío</span>
                      </div>
                    </button>
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-neutral-200"></div>
                      </div>
                      <div className="relative flex justify-center text-[9px] font-black uppercase tracking-[0.2em] text-neutral-400">
                        <span className="bg-white px-3">O ingresa manualmente</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <input 
                        type="text" 
                        placeholder="Escribe tu dirección (Ciudad, Calle, Referencia)..."
                        onBlur={(e) => setManualAddress(e.target.value)}
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-md text-black text-xs py-3 px-4 outline-none focus:border-neutral-500 transition-colors placeholder:text-neutral-400" 
                      />
                    </div>
                    {locError && <p className="text-[10px] text-red-500 text-center leading-relaxed px-4">{locError}</p>}
                  </div>
                ) : (
                  <div className="space-y-3 border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="relative" style={{ height: 160 }}>
                      <iframe
                        title="Mapa de entrega"
                        src={`https://www.google.com/maps?q=${location.lat},${location.lng}&z=15&output=embed`}
                        className="w-full h-full border-0 grayscale-[0.5]"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-4 bg-white">
                      <p className="text-[11px] text-neutral-700 leading-relaxed line-clamp-2">{location.address}</p>
                      <button type="button" onClick={() => setLocation(null)}
                        className="mt-3 text-[9px] text-neutral-500 hover:text-black underline underline-offset-2 transition-colors uppercase tracking-widest font-bold">
                        Cambiar ubicación
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Order summary */}
              <div className="bg-neutral-50 border border-neutral-100 rounded-xl p-5 space-y-4">
                <p className="text-[11px] font-black tracking-[0.1em] text-neutral-400 uppercase mb-4">Resumen del pedido</p>
                <div className="flex justify-between text-[13px] text-neutral-600 pb-4 border-b border-neutral-200/50">
                  <span>Productos ({count})</span>
                  <span className="tabular-nums font-bold text-black">{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-[14px] font-black pt-1">
                  <span className="text-black uppercase tracking-wider">Total</span>
                  <span className="text-black tabular-nums">{formatPrice(total)}</span>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-neutral-100 bg-white">
              <button type="submit" disabled={submitting || !location}
                className="w-full bg-black text-white py-4 text-[12px] font-black uppercase tracking-widest hover:bg-neutral-800 transition-all rounded-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {submitting && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {submitting ? 'Enviando...' : 'Confirmar Pedido'}
              </button>
              <p className="text-[9px] text-neutral-400 text-center mt-4 px-2 leading-relaxed">
                El pedido se enviará a través de WhatsApp para confirmar detalles con un asesor.
              </p>
            </div>
          </form>
        )}

        {/* ── SUCCESS STEP ── */}
        {step === 'success' && (
          <div className="flex-grow flex flex-col items-center justify-center p-8 text-center gap-5 bg-white">
            <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 flex items-center justify-center rounded-full">
              <span className="material-symbols-outlined text-3xl text-emerald-500" aria-hidden="true">check_circle</span>
            </div>
            <div>
              <h3 className="font-headline text-lg uppercase tracking-widest text-black mb-2">¡Pedido Recibido!</h3>
              <p className="text-sm text-neutral-600 leading-relaxed">
                Gracias, <span className="text-black font-bold">{form.nombre}</span>. Nos pondremos en contacto contigo pronto para coordinar la entrega.
              </p>
            </div>
            <button onClick={reset}
              className="mt-4 bg-black text-white px-8 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-800 transition-all">
              Seguir Comprando
            </button>
          </div>
        )}
      </aside>
    </>

  )
}
