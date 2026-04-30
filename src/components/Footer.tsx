'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getSettings, getCategories } from '@/lib/data'
import { StoreSettings, Category } from '@/lib/types'

export default function Footer() {
  const [settings, setSettings] = useState<StoreSettings | null>(null)
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    getSettings().then(setSettings).catch(() => {})
    getCategories().then(cats => {
      const roots = cats.filter(c => !c.parent_id && !c.parentId)
      setCategories(roots.slice(0, 5))
    }).catch(() => {})
  }, [])

  const helpLinks = settings?.footer_help_links || [
    { label: 'Contacto', url: '/contact' },
    { label: 'Términos de Envío', url: '/shipping' },
    { label: 'Métodos de pago', url: '/payment' },
    { label: 'Política de Cambios', url: '/returns' },
  ]

  return (
    <footer className="bg-black text-white pt-24 pb-12 px-6 md:px-12 border-t border-white/5">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8">
        
        {/* Left Column: Logo & Social */}
        <div className="flex flex-col items-center md:items-start">
          <div className="mb-8 group">
            <Link href="/" className="relative block w-20 h-16">
              <img src="/logo.png" alt="ADONIS" className="w-full h-full object-contain scale-[2.5] origin-left drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]" />
            </Link>
          </div>
          <p className="text-[11px] text-neutral-500 uppercase tracking-[0.2em] mb-10 font-medium">
            {settings?.address_footer || 'Luque Paraguay'}
          </p>
          <div className="flex gap-10 text-[10px] font-black tracking-[0.3em] text-neutral-400">
            <Link href={settings?.instagram_url || 'https://instagram.com'} target="_blank" className="hover:text-white transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[1px] after:bg-white hover:after:w-full after:transition-all">
              INSTAGRAM
            </Link>
            <Link href={settings?.tiktok_url || 'https://tiktok.com'} target="_blank" className="hover:text-white transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[1px] after:bg-white hover:after:w-full after:transition-all">
              TIKTOK
            </Link>
          </div>
        </div>

        {/* Center Column: Products */}
        <div className="flex flex-col items-center">
          <h3 className="text-[11px] font-black uppercase tracking-[0.4em] mb-10 text-white/90">PRODUCTOS</h3>
          <div className="flex flex-col items-center gap-6">
            {categories.map(cat => (
              <Link 
                key={cat.id} 
                href={`/products?category=${cat.slug}`} 
                className="text-[13px] text-neutral-500 hover:text-white transition-colors font-medium tracking-wide"
              >
                {cat.name}
              </Link>
            ))}
            {categories.length === 0 && (
              <>
                <Link href="/products?category=pulseras" className="text-[13px] text-neutral-500 hover:text-white transition-colors font-medium tracking-wide">Pulseras</Link>
                <Link href="/products?category=cadenas" className="text-[13px] text-neutral-500 hover:text-white transition-colors font-medium tracking-wide">Cadenas</Link>
                <Link href="/products?category=billeteras" className="text-[13px] text-neutral-500 hover:text-white transition-colors font-medium tracking-wide">Billeteras</Link>
              </>
            )}
          </div>
        </div>

        {/* Right Column: Help */}
        <div className="flex flex-col items-center md:items-end">
          <h3 className="text-[11px] font-black uppercase tracking-[0.4em] mb-10 text-white/90">AYUDA</h3>
          <div className="flex flex-col items-center md:items-end gap-6">
            {helpLinks.map((link, i) => (
              <Link 
                key={i} 
                href={link.url} 
                className="text-[13px] text-neutral-500 hover:text-white transition-colors font-medium tracking-wide"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-24 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-[9px] text-neutral-600 uppercase tracking-[0.25em] font-bold">
          © {new Date().getFullYear()} ADONIS STORE. TODOS LOS DERECHOS RESERVADOS.
        </div>
        <div className="flex gap-6 items-center grayscale opacity-30 hover:grayscale-0 hover:opacity-100 transition-all">
          <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-3" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-5" />
        </div>
      </div>
    </footer>
  )
}
