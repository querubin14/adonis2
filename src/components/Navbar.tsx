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

  return (
    <>
      {settings?.top_bar_text && (
        <div className="bg-white text-black py-2 text-center text-[10px] font-black uppercase tracking-[0.3em] fixed top-0 w-full z-[60]">
          {settings.top_bar_text}
        </div>
      )}
      <nav className={`fixed ${settings?.top_bar_text ? 'top-8' : 'top-0'} w-full z-50 bg-neutral-950/60 backdrop-blur-xl flex justify-between items-center px-6 md:px-12 py-3 transition-all duration-300`}>
        <div className="flex items-center gap-4">
          {/* Hamburger — mobile only, moved to left */}
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menú"
            className="md:hidden text-white hover:text-neutral-300 transition-colors"
          >
            <span className="material-symbols-outlined text-2xl" aria-hidden="true">menu</span>
          </button>
          
          <Link href="/" className="flex items-center justify-center w-16 md:w-20 h-10 md:h-12">
            <img src="/logo.png" alt="ADONIS STORE" className="h-full w-full object-contain scale-[2.2] md:scale-[2.6] drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] pointer-events-none" />
          </Link>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex gap-10 items-center">
          {navLinks.map(link =>
            link.children && link.children.length > 0 ? (
              <div key={link.id} className="relative group">
                <Link
                  href={link.url}
                  className="font-headline tracking-[0.2em] uppercase text-xs text-neutral-400 hover:text-white transition-colors duration-300 font-bold flex items-center gap-0.5"
                >
                  {link.label}
                  <span className="material-symbols-outlined text-sm leading-none" aria-hidden="true">
                    expand_more
                  </span>
                </Link>
                {/* Dropdown panel */}
                <div className="absolute top-full left-0 pt-3 min-w-[200px] opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 translate-y-1 group-hover:translate-y-0">
                  <div className="bg-neutral-950/95 backdrop-blur-xl border border-neutral-800 py-2">
                    {link.children.map(child => (
                      <Link
                        key={child.id}
                        href={child.url}
                        className="block px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest text-neutral-400 hover:text-white hover:bg-neutral-800/40 transition-all"
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
                className="font-headline tracking-[0.2em] uppercase text-xs text-neutral-400 hover:text-white transition-colors duration-300 font-bold"
              >
                {link.label}
              </Link>
            )
          )}
        </div>

        <div className="flex items-center gap-5">
          {/* Search */}
          <button
            onClick={() => setSearchOpen(true)}
            aria-label="Buscar"
            className="text-white hover:text-neutral-300 transition-colors"
          >
            <span className="material-symbols-outlined text-2xl" aria-hidden="true">search</span>
          </button>

          {/* Favorites - Desktop only */}
          <Link href="/favorites" aria-label={`Favoritos (${favCount})`} className="hidden md:block relative text-white hover:text-neutral-300 transition-colors">
            <span
              className={`material-symbols-outlined text-2xl ${favPop ? 'heart-pop' : ''}`}
              aria-hidden="true"
              style={{ fontVariationSettings: favCount > 0 ? "'FILL' 1" : "'FILL' 0" }}
            >
              favorite
            </span>
            {favCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-white text-black text-[9px] w-4 h-4 flex items-center justify-center font-bold leading-none">
                {favCount > 9 ? '9+' : favCount}
              </span>
            )}
          </Link>

          {/* Cart - Desktop only */}
          <button
            onClick={openCart}
            aria-label={`Carrito (${count} piezas)`}
            className="hidden md:block relative text-white hover:text-neutral-300 transition-colors"
          >
            <span className="material-symbols-outlined text-2xl" aria-hidden="true">shopping_bag</span>
            {count > 0 && (
              <span className={`absolute -top-1 -right-1 bg-white text-black text-[9px] w-4 h-4 flex items-center justify-center font-bold leading-none ${cartPop ? 'cart-bump' : ''}`}>
                {count > 9 ? '9+' : count}
              </span>
            )}
          </button>


        </div>
      </nav>

      {/* ── Mobile Menu ── */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          {/* Drawer */}
          <div 
            className={`fixed left-0 top-0 h-full w-72 z-50 bg-[#0d0d0d] border-r border-neutral-800 flex flex-col md:hidden transition-transform duration-500 ease-out ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
          >
            <div className="flex items-center justify-between px-6 py-6 border-b border-neutral-800">
              <div className="w-16 h-8 flex items-center justify-center">
                <img src="/logo.png" alt="ADONIS STORE" className="h-full w-full object-contain scale-[2.2] drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Cerrar menú"
                className="text-neutral-400 hover:text-white transition-colors p-1"
              >
                <span className="material-symbols-outlined text-xl" aria-hidden="true">close</span>
              </button>
            </div>

            <nav className="flex-grow overflow-y-auto py-3" aria-label="Navegación móvil">
              {navLinks.map(link => (
                <div key={link.id}>
                  <div className="flex items-center">
                    <Link
                      href={link.url}
                      onClick={() => setMobileOpen(false)}
                      className="flex-grow px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-neutral-300 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                    {link.children && link.children.length > 0 && (
                      <button
                        onClick={() => toggleExpand(link.id)}
                        aria-label={expandedIds.includes(link.id) ? 'Contraer' : 'Expandir'}
                        className="pr-6 pl-2 py-4 text-neutral-500 hover:text-white transition-colors"
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
                    <div className="border-l-2 border-neutral-700 ml-6 mb-1">
                      {link.children.map(child => (
                        <Link
                          key={child.id}
                          href={child.url}
                          onClick={() => setMobileOpen(false)}
                          className="block px-5 py-3 text-[9px] font-bold uppercase tracking-widest text-neutral-500 hover:text-white transition-colors"
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
            <div className="p-4 border-t border-neutral-800 grid grid-cols-2 gap-3">
              <Link
                href="/favorites"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 py-3 border border-neutral-700 text-[9px] font-bold uppercase tracking-widest text-neutral-400 hover:text-white hover:border-white transition-all"
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
                className="flex items-center justify-center gap-2 py-3 border border-neutral-700 text-[9px] font-bold uppercase tracking-widest text-neutral-400 hover:text-white hover:border-white transition-all"
              >
                <span className="material-symbols-outlined text-base" aria-hidden="true">shopping_bag</span>
                Carrito
              </button>
            </div>
          </div>
        </>
      )}

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
