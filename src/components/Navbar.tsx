'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { useFavorites } from '@/hooks/useFavorites'
import SearchModal from '@/components/SearchModal'
import { getNavLinks, getSettings } from '@/lib/data'
import { NavLink, StoreSettings } from '@/lib/types'

const FALLBACK_LINKS: NavLink[] = [
  { id: '1', label: 'Colecciones', url: '/products', sort_order: 0, is_active: true },
  { id: '2', label: 'Alta Joyería', url: '/products', sort_order: 1, is_active: true },
  { id: '3', label: 'El Archivo', url: '/products', sort_order: 2, is_active: true },
]

function buildNavTree(flat: NavLink[]): NavLink[] {
  const map = new Map<string, NavLink>()
  flat.forEach(n => map.set(n.id, { ...n, children: [] }))
  const roots: NavLink[] = []
  map.forEach(node => {
    if (node.parent_id && map.has(node.parent_id)) {
      map.get(node.parent_id)!.children!.push(node)
    } else {
      roots.push(node)
    }
  })
  function sort(nodes: NavLink[]): NavLink[] {
    return nodes
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      .map(n => ({ ...n, children: sort(n.children ?? []) }))
  }
  return sort(roots)
}

export default function Navbar() {
  const { count, open: openCart } = useCart()
  const { count: favCount } = useFavorites()
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [expandedIds, setExpandedIds] = useState<string[]>([])
  const [navLinks, setNavLinks] = useState<NavLink[]>(buildNavTree(FALLBACK_LINKS))
  const [settings, setSettings] = useState<StoreSettings | null>(null)

  // Heart animation on favorites increase
  const prevFavCount = useRef(favCount)
  const [favPop, setFavPop] = useState(false)
  const favTimer = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (favCount > prevFavCount.current) {
      if (favTimer.current) clearTimeout(favTimer.current)
      setFavPop(true)
      favTimer.current = setTimeout(() => setFavPop(false), 400)
    }
    prevFavCount.current = favCount
  }, [favCount])

  // Cart badge animation on count increase
  const prevCount = useRef(count)
  const [cartPop, setCartPop] = useState(false)
  const cartTimer = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (count > prevCount.current) {
      if (cartTimer.current) clearTimeout(cartTimer.current)
      setCartPop(true)
      cartTimer.current = setTimeout(() => setCartPop(false), 350)
    }
    prevCount.current = count
  }, [count])

  // Load nav links from DB
  useEffect(() => {
    getNavLinks()
      .then(links => {
        if (links.length > 0) setNavLinks(buildNavTree(links))
      })
      .catch(() => {/* keep fallback */})

    getSettings()
      .then(s => setSettings(s))
      .catch(() => {})
  }, [])

  function toggleExpand(id: string) {
    setExpandedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  // Theme toggle logic
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const saved = localStorage.getItem('theme') as 'light' | 'dark'
    if (saved) {
      setTheme(saved)
      document.documentElement.classList.toggle('dark', saved === 'dark')
    }
  }, [])

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    localStorage.setItem('theme', next)
    document.documentElement.classList.toggle('dark', next === 'dark')
  }

  return (
    <>
      {settings?.top_bar_text && (
        <div className="bg-white text-black py-1.5 flex justify-center items-center gap-4 fixed top-0 w-full z-[60] px-6 border-b border-neutral-200">

          <div className="flex items-center gap-4 absolute left-6 md:left-12">
            <Link href={settings.instagram_url || 'https://instagram.com'} target="_blank" className="hover:scale-110 transition-transform">
              <img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png" alt="IG" className="h-3 w-3 brightness-0" />
            </Link>
            <Link href={settings.tiktok_url || 'https://tiktok.com'} target="_blank" className="hover:scale-110 transition-transform">
              <svg className="h-3 w-3 fill-black" viewBox="0 0 24 24">
                <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.06-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.03 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-3.4 2.97-6.28 6.37-6.51.29-.02.59-.03.89-.03v4.17c-1.32.07-2.61.93-3.05 2.13-.46 1.15-.19 2.48.59 3.4.63.77 1.64 1.22 2.65 1.21.72-.01 1.43-.22 2.03-.62.83-.56 1.34-1.53 1.35-2.51.02-3.23.01-6.46.01-9.69-.01-2.33.01-4.66 0-7z"/>
              </svg>


            </Link>
          </div>
          <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] md:tracking-[0.4em] text-center w-full">
            {settings.top_bar_text}
          </span>
        </div>
      )}
      <nav className={`fixed ${settings?.top_bar_text ? 'top-8' : 'top-0'} w-full z-50 bg-white/95 backdrop-blur-xl border-b border-neutral-200 flex justify-between items-center px-6 md:px-12 py-3 transition-all duration-300`}>
        <div className="flex items-center gap-4">
          {/* Hamburger — mobile only, moved to left */}
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menú"
            className="md:hidden text-black hover:text-neutral-600 transition-colors"
          >
            <span className="material-symbols-outlined text-2xl" aria-hidden="true">menu</span>
          </button>
          
          <Link href="/" className="flex items-center justify-center w-16 md:w-20 h-10 md:h-12">
            <img src="/logo.png" alt="ADONIS STORE" className="h-full w-full object-contain scale-[2.2] md:scale-[2.6] brightness-0 pointer-events-none" />
          </Link>
        </div>




        {/* Desktop Nav */}
        <div className="hidden md:flex gap-10 items-center">
          {navLinks.map(link =>
            link.children && link.children.length > 0 ? (
              <div key={link.id} className="relative group">
                <Link
                  href={link.url}
                  className="font-headline tracking-[0.2em] uppercase text-xs text-neutral-500 hover:text-black transition-colors duration-300 font-bold flex items-center gap-0.5"
                >
                  {link.label}
                  <span className="material-symbols-outlined text-sm leading-none" aria-hidden="true">
                    expand_more
                  </span>
                </Link>
                {/* Dropdown panel */}
                <div className="absolute top-full left-0 pt-3 min-w-[200px] opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 translate-y-1 group-hover:translate-y-0">
                  <div className="bg-white border border-neutral-200 shadow-xl py-2">
                    {link.children.map(child => (
                      <Link
                        key={child.id}
                        href={child.url}
                        className="block px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest text-neutral-600 hover:text-black hover:bg-neutral-50 transition-all"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <Link
                key={link.id}
                href={link.url}
                className="font-headline tracking-[0.2em] uppercase text-xs text-neutral-500 hover:text-black transition-colors duration-300 font-bold"
              >
                {link.label}
              </Link>


            )
          )}
        </div>


        <div className="flex items-center gap-5">
          <button
            onClick={() => setSearchOpen(true)}
            aria-label="Buscar"
            className="text-black hover:text-neutral-500 transition-colors"
          >
            <span className="material-symbols-outlined text-2xl" aria-hidden="true">search</span>
          </button>


          <Link href="/favorites" aria-label={`Favoritos (${favCount})`} className="hidden md:block relative text-black hover:text-neutral-500 transition-colors">
            <span
              className={`material-symbols-outlined text-2xl ${favPop ? 'heart-pop' : ''}`}
              aria-hidden="true"
              style={{ fontVariationSettings: favCount > 0 ? "'FILL' 1" : "'FILL' 0" }}
            >
              favorite
            </span>
            {favCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-black text-white text-[9px] w-4 h-4 flex items-center justify-center font-bold leading-none">
                {favCount > 9 ? '9+' : favCount}
              </span>
            )}
          </Link>


          <button
            onClick={openCart}
            aria-label={`Carrito (${count} piezas)`}
            className="hidden md:block relative text-black hover:text-neutral-500 transition-colors"
          >
            <span className="material-symbols-outlined text-2xl" aria-hidden="true">shopping_bag</span>
            {count > 0 && (
              <span className={`absolute -top-1 -right-1 bg-black text-white text-[9px] w-4 h-4 flex items-center justify-center font-bold leading-none ${cartPop ? 'cart-bump' : ''}`}>
                {count > 9 ? '9+' : count}
              </span>
            )}
          </button>


        </div>
      </nav>

      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          {/* Drawer */}
          <div 
            className={`fixed left-0 top-0 h-full w-72 z-50 bg-white dark:bg-[#0d0d0d] border-r border-neutral-100 dark:border-neutral-800 flex flex-col md:hidden transition-transform duration-500 ease-out ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
          >
            <div className="flex flex-col items-center justify-center px-6 py-10 border-b border-neutral-100 dark:border-neutral-800 relative">
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Cerrar menú"
                className="absolute right-4 top-4 text-neutral-400 hover:text-black dark:hover:text-white transition-colors p-1"
              >
                <span className="material-symbols-outlined text-xl" aria-hidden="true">close</span>
              </button>
              <div className="w-24 h-10 flex items-center justify-center">
                <img src="/logo.png" alt="ADONIS STORE" className="h-full w-full object-contain scale-[2.2] brightness-0 dark:invert" />
              </div>
            </div>


            <nav className="flex-grow overflow-y-auto py-3" aria-label="Navegación móvil">
              {navLinks.map(link => (
                <div key={link.id}>
                  <div className="flex items-center">
                    <Link
                      href={link.url}
                      onClick={() => setMobileOpen(false)}
                      className="flex-grow px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                    {link.children && link.children.length > 0 && (
                      <button
                        onClick={() => toggleExpand(link.id)}
                        aria-label={expandedIds.includes(link.id) ? 'Contraer' : 'Expandir'}
                        className="pr-6 pl-2 py-4 text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
                      >
                        <span
                          className={`material-symbols-outlined text-base block transition-transform duration-200 ${expandedIds.includes(link.id) ? 'rotate-180' : ''}`}
                          aria-hidden="true"
                        >
                          expand_more
                        </span>
                      </button>
                    )}
                  </div>
                  {/* Children accordion */}
                  {link.children && link.children.length > 0 && expandedIds.includes(link.id) && (
                    <div className="border-l-2 border-neutral-100 dark:border-neutral-700 ml-6 mb-1">
                      {link.children.map(child => (
                        <Link
                          key={child.id}
                          href={child.url}
                          onClick={() => setMobileOpen(false)}
                          className="block px-5 py-3 text-[9px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Bottom quick actions */}
            <div className="p-4 border-t border-neutral-100 dark:border-neutral-800 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/favorites"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 py-3 border border-neutral-200 dark:border-neutral-700 text-[9px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:border-black dark:hover:border-white transition-all"
                >
                  <span
                    className="material-symbols-outlined text-base"
                    aria-hidden="true"
                    style={{ fontVariationSettings: favCount > 0 ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    favorite
                  </span>
                  Favoritos
                </Link>
                <button
                  onClick={() => { setMobileOpen(false); openCart() }}
                  className="flex items-center justify-center gap-2 py-3 border border-neutral-200 dark:border-neutral-700 text-[9px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:border-black dark:hover:border-white transition-all"
                >
                  <span className="material-symbols-outlined text-base" aria-hidden="true">shopping_bag</span>
                  Carrito
                </button>
              </div>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="w-full flex items-center justify-center gap-3 py-3.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 text-[9px] font-black uppercase tracking-[0.2em] text-black dark:text-white transition-all hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <span className="material-symbols-outlined text-lg">
                  {theme === 'light' ? 'dark_mode' : 'light_mode'}
                </span>
                {theme === 'light' ? 'Modo Oscuro' : 'Modo Claro'}
              </button>
            </div>
          </div>
        </>
      )}

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}

