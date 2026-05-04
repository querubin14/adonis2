'use client'

import { useState } from 'react'
import Image from 'next/image'

interface ProductGalleryProps {
  images: string[]
  name: string
}

export default function ProductGallery({ images, name }: ProductGalleryProps) {
  const [current, setCurrent] = useState(0)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  // the required distance between touchStart and touchEnd to be detected as a swipe
  const minSwipeDistance = 50 

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX)

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance
    if (isLeftSwipe) {
      next()
    }
    if (isRightSwipe) {
      prev()
    }
  }

  if (!images || images.length === 0) {
    return (
      <div className="bg-neutral-50 dark:bg-neutral-900 aspect-square md:aspect-[4/5] flex items-center justify-center relative overflow-hidden border border-neutral-100 dark:border-white/5">
        <div className="text-center p-12">
          <span className="material-symbols-outlined text-6xl text-neutral-300 dark:text-neutral-800 mb-4 block">image</span>
          <p className="font-sans text-neutral-400 dark:text-neutral-600 text-[10px] uppercase tracking-widest font-bold">Sin imagen</p>
        </div>
      </div>

    )
  }

  const next = () => setCurrent((prev) => (prev + 1) % images.length)
  const prev = () => setCurrent((prev) => (prev - 1 + images.length) % images.length)

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div 
        className="group bg-neutral-50 dark:bg-neutral-900 aspect-square md:aspect-[4/5] flex items-center justify-center relative overflow-hidden border border-neutral-100 dark:border-white/5"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >

        <Image 
          src={images[current]} 
          alt={name} 
          fill
          className="object-cover"
          priority
        />
        
        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button 
              onClick={(e) => { e.preventDefault(); prev() }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white transition-opacity hover:bg-black/60 shadow-lg opacity-0 group-hover:opacity-100"
              aria-label="Anterior"
            >
              <span className="material-symbols-outlined text-[20px]">chevron_left</span>
            </button>
            <button 
              onClick={(e) => { e.preventDefault(); next() }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white transition-opacity hover:bg-black/60 shadow-lg opacity-0 group-hover:opacity-100"
              aria-label="Siguiente"
            >
              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
            </button>
          </>
        )}
      </div>
      
      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {images.map((img, i) => (
            <button 
              key={i} 
              onClick={() => setCurrent(i)}
              className={`flex-shrink-0 w-24 aspect-square overflow-hidden relative transition-all ${
                current === i ? 'border border-black dark:border-white p-0.5' : 'border border-neutral-100 dark:border-white/5 opacity-50 hover:opacity-100'
              }`}

            >
              <div className="w-full h-full relative">
                <Image 
                  src={img} 
                  alt={`${name} detail ${i}`} 
                  fill
                  className="object-cover bg-neutral-900" 
                />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}


