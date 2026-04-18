'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { HeroSettings } from '@/lib/types'

export default function HeroSlider({ heroes }: { heroes: HeroSettings[] }) {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const total = heroes.length

  function next() { setCurrent(i => (i + 1) % total) }
  function prev() { setCurrent(i => (i - 1 + total) % total) }
  function goTo(i: number) { setCurrent(i) }

  useEffect(() => {
    if (paused || total <= 1) return
    timerRef.current = setInterval(next, 5000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [paused, total, current])

  if (total === 0) return null

  const hero = heroes[current]

  return (
    <section
      className="relative h-[58vh] md:h-[65vh] flex items-end overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slides */}
      {heroes.map((h, i) => (
        <div
          key={h.id}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{ opacity: i === current ? 1 : 0, zIndex: i === current ? 1 : 0 }}
          aria-hidden={i !== current}
        >
          {h.image_url ? (
            <img
              src={h.image_url}
              alt=""
              aria-hidden="true"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-neutral-950" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        </div>
      ))}

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 pb-10 md:pb-14">
        <div className="max-w-2xl">
          {hero.subtitle && (
            <span className="font-label uppercase tracking-[0.45em] text-[9px] text-secondary mb-5 block font-bold">
              {hero.subtitle}
            </span>
          )}
          <h1 className="font-antonio text-6xl md:text-8xl lg:text-[10rem] mb-12 leading-[0.8] tracking-tighter uppercase flex flex-col items-start translate-y-4">
            <span className="block">{hero.title.split(' ')[0]}</span>
            <span className="text-outline block -mt-4 md:-mt-8 lg:-mt-12">
              {hero.title.split(' ').slice(1).join(' ')}
            </span>
          </h1>
          {hero.cta_text && hero.cta_url && (
            <div className="flex items-center gap-6">
              <Link
                href={hero.cta_url}
                className="px-10 py-4 bg-white text-black font-label uppercase text-[10px] tracking-[0.3em] font-bold hover:bg-neutral-200 transition-all"
              >
                {hero.cta_text}
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Prev / Next arrows (only when multiple) */}
      {total > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Anterior"
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 p-2 text-white/50 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-3xl" aria-hidden="true">chevron_left</span>
          </button>
          <button
            onClick={next}
            aria-label="Siguiente"
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 p-2 text-white/50 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-3xl" aria-hidden="true">chevron_right</span>
          </button>
        </>
      )}

      {/* Dot indicators */}
      {total > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2" role="tablist" aria-label="Diapositivas">
          {heroes.map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === current}
              aria-label={`Ir a diapositiva ${i + 1}`}
              onClick={() => goTo(i)}
              className={`transition-all ${i === current ? 'w-6 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/30 hover:bg-white/60'}`}
            />
          ))}
        </div>
      )}

      {/* Scroll indicator */}
      <div className="absolute bottom-8 right-12 z-20 flex-col items-center gap-2 hidden md:flex">
        <div className="w-px h-12 bg-gradient-to-b from-transparent to-neutral-600" aria-hidden="true" />
        <span className="text-[8px] uppercase tracking-[0.4em] text-neutral-600 font-bold rotate-90 origin-center mt-4">Scroll</span>
      </div>
    </section>
  )
}
