'use client'

import { useState } from 'react'
import Image from 'next/image'

interface ProductGalleryProps {
  images: string[]
  name: string
}

export default function ProductGallery({ images, name }: ProductGalleryProps) {
  const [current, setCurrent] = useState(0)

  if (!images || images.length === 0) {
    return (
      <div className="bg-surface-container-low aspect-[3/4] flex items-center justify-center relative overflow-hidden border border-neutral-800/50 rounded-sm">
        <div className="text-center p-12">
          <span className="material-symbols-outlined text-6xl text-neutral-800 mb-4 block">diamond</span>
          <p className="font-headline text-neutral-600 font-bold uppercase tracking-widest text-[10px]">Archivo de Obra Maestra</p>
        </div>
      </div>
    )
  }

  const next = () => setCurrent((prev) => (prev + 1) % images.length)
  const prev = () => setCurrent((prev) => (prev - 1 + images.length) % images.length)

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="group bg-neutral-900 aspect-[3/4] flex items-center justify-center relative overflow-hidden border border-neutral-800/50 rounded-sm">
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
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white transition-opacity hover:bg-black/60"
              aria-label="Anterior"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button 
              onClick={(e) => { e.preventDefault(); next() }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white transition-opacity hover:bg-black/60"
              aria-label="Siguiente"
            >
              <span className="material-symbols-outlined">chevron_right</span>
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
              className={`flex-shrink-0 w-20 aspect-square border overflow-hidden relative transition-all ${
                current === i ? 'border-white' : 'border-neutral-800 opacity-60 hover:opacity-100'
              }`}
            >
              <Image 
                src={img} 
                alt={`${name} detail ${i}`} 
                fill
                className="object-cover" 
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
