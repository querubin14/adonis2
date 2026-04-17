'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { label: 'Panel',        icon: 'dashboard',       href: '/admin' },
  { label: 'Productos',    icon: 'inventory_2',     href: '/admin/products' },
  { label: 'Categorías',   icon: 'account_tree',    href: '/admin/categories' },
  { label: 'Diseños',      icon: 'design_services', href: '/admin/designs' },
  { label: 'Reseñas',      icon: 'reviews',         href: '/admin/reviews' },
  { label: 'Navegación',   icon: 'link',            href: '/admin/navigation' },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="h-screen w-56 fixed left-0 top-0 bg-surface-container-low flex flex-col z-40 border-r border-outline-variant/10">
      <div className="px-6 py-7 border-b border-outline-variant/10">
        <p className="text-[8px] tracking-[0.45em] text-neutral-500 uppercase font-bold mb-1.5">
          Panel de Control
        </p>
        <h1 className="font-headline text-lg tracking-[0.25em] text-white uppercase">ADONIS</h1>
      </div>

      <nav className="flex flex-col gap-0.5 p-3 flex-grow" aria-label="Navegación del panel">
        {NAV.map(item => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={`flex items-center gap-3 px-4 py-3 transition-all text-[10px] font-bold uppercase tracking-wider ${
                active
                  ? 'bg-white text-black'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/40'
              }`}
            >
              <span className="material-symbols-outlined text-base" aria-hidden="true">
                {item.icon}
              </span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-outline-variant/10">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-neutral-500 hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined text-base" aria-hidden="true">arrow_back</span>
          Volver al Sitio
        </Link>
      </div>
    </aside>
  )
}
