'use client'

import { useState, useEffect, useRef } from 'react'
import { Review } from '@/lib/types'

const FALLBACK_REVIEWS: Review[] = [
  { id: '1', name: 'Valentina M.', location: 'Asunción', rating: 5, text: 'Compré un collar de oro para mi aniversario y superó todas mis expectativas. La calidad es excepcional, parece sacado de una joyería de lujo en París.' },
  { id: '2', name: 'Roberto K.', location: 'Encarnación', rating: 5, text: 'Las piezas son únicas, nunca he visto nada igual. El anillo que elegí para mi esposa tiene una artesanía impecable. Ya somos clientes permanentes.' },
  { id: '3', name: 'Sofía L.', location: 'Ciudad del Este', rating: 5, text: 'Mi collar llegó en perfectas condiciones, con un empaque hermoso. El servicio fue rápido y muy profesional. Lo recomiendo totalmente.' },
  { id: '4', name: 'Carlos D.', location: 'Luque', rating: 5, text: 'Compré unos aretes como regalo y la reacción fue increíble. Definitivamente la mejor joyería de alta gama que he encontrado en Paraguay.' },
  { id: '5', name: 'María T.', location: 'San Lorenzo', rating: 5, text: 'Cada detalle refleja pasión y conocimiento. El brazalete de plata que llevo todos los días recibe cumplidos constantemente. ¡Gracias Adonis!' },
]

export default function ReviewsCarousel({ reviews: serverReviews }: { reviews?: Review[] }) {
  const reviews = (serverReviews && serverReviews.length > 0) ? serverReviews : FALLBACK_REVIEWS
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const total = reviews.length
  const trackRef = useRef<HTMLDivElement>(null)
  // photo_url for DB reviews, photo for legacy
  function getPhoto(r: Review) { return (r as any).photo_url ?? (r as any).photo ?? null }

  useEffect(() => {
    if (paused || total <= 1) return
    const t = setInterval(() => setCurrent(i => (i + 1) % total), 5000)
    return () => clearInterval(t)
  }, [paused, total])

  // Scroll to current card
  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    const card = el.children[current] as HTMLElement | undefined
    if (card) {
      el.scrollTo({ left: card.offsetLeft - el.offsetLeft, behavior: 'smooth' })
    }
  }, [current])

  return (
    <section
      className="border-t border-outline-variant/10 py-20 px-6 md:px-12"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-[9px] uppercase tracking-[0.45em] text-secondary font-bold mb-3">Lo que dicen</p>
            <h2 className="font-headline text-3xl md:text-4xl text-white uppercase tracking-tight">Reseñas</h2>
          </div>
          {/* Dot indicators */}
          <div className="flex items-center gap-2">
            {reviews.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                aria-label={`Reseña ${i + 1}`}
                className={`transition-all duration-300 ${i === current ? 'w-6 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-neutral-700 hover:bg-neutral-500'}`}
              />
            ))}
          </div>
        </div>

        {/* Cards track — horizontal scroll, snap */}
        <div
          ref={trackRef}
          className="flex gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {reviews.map((r, i) => (
            <article
              key={r.id}
              onClick={() => setCurrent(i)}
              className={`flex-shrink-0 snap-start w-[82vw] md:w-[calc(33.333%-1rem)] border p-7 cursor-pointer transition-all duration-500 ${
                i === current
                  ? 'border-neutral-500 bg-surface-container-low'
                  : 'border-neutral-800 bg-transparent hover:border-neutral-600'
              }`}
            >
              {/* Optional media */}
              {getPhoto(r) && (
                <div className="w-full aspect-video mb-5 overflow-hidden bg-neutral-900">
                  <img src={getPhoto(r)!} alt={`Foto de ${r.name}`} className="w-full h-full object-cover" />
                </div>
              )}

              {/* Stars */}
              <div className="flex gap-0.5 mb-5" aria-label={`${r.rating} estrellas`}>
                {Array.from({ length: 5 }).map((_, si) => (
                  <span
                    key={si}
                    className={`material-symbols-outlined text-sm ${si < r.rating ? 'text-yellow-400' : 'text-neutral-700'}`}
                    style={{ fontVariationSettings: si < r.rating ? "'FILL' 1" : "'FILL' 0" }}
                    aria-hidden="true"
                  >
                    star
                  </span>
                ))}
              </div>

              {/* Quote */}
              <p className="text-neutral-300 text-sm leading-relaxed font-light mb-7 line-clamp-4">
                &ldquo;{r.text}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-neutral-800 border border-neutral-700 flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-bold text-neutral-300 uppercase">{r.name[0]}</span>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-white uppercase tracking-wider leading-none">{r.name}</p>
                  <p className="text-[9px] text-neutral-600 uppercase tracking-wider mt-0.5">{r.location}</p>
                </div>
                <span className="ml-auto material-symbols-outlined text-sm text-neutral-700" aria-hidden="true" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  )
}
