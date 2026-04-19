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
      <div className="bg-gray-100 aspect-square md:aspect-[4/5] flex items-center justify-center relative overflow-hidden border border-gray-200">
        <div className="text-center p-12">
          <span className="material-symbols-outlined text-6xl text-gray-300 mb-4 block">image</span>
          <p className="font-sans text-gray-500 text-xs">Sin imagen</p>
        </div>
      </div>
    )
  }

  const next = () => setCurrent((prev) => (prev + 1) % images.length)
  const prev = () => setCurrent((prev) => (prev - 1 + images.length) % images.length)

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="group bg-[#f9f9f9] aspect-square md:aspect-[4/5] flex items-center justify-center relative overflow-hidden border border-gray-100">
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
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 border border-gray-200 flex items-center justify-center text-black transition-opacity hover:bg-white shadow-sm opacity-0 group-hover:opacity-100"
              aria-label="Anterior"
            >
              <span className="material-symbols-outlined text-[20px]">chevron_left</span>
            </button>
            <button 
              onClick={(e) => { e.preventDefault(); next() }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 border border-gray-200 flex items-center justify-center text-black transition-opacity hover:bg-white shadow-sm opacity-0 group-hover:opacity-100"
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
                current === i ? 'border-[1.5px] border-black p-0.5' : 'border border-gray-200 opacity-70 hover:opacity-100'
              }`}
            >
              <div className="w-full h-full relative">
                <Image 
                  src={img} 
                  alt={`${name} detail ${i}`} 
                  fill
                  className="object-cover bg-[#f9f9f9]" 
                />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

