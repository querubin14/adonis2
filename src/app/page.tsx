import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { getProducts, getCategories, getHeroes, getReviews, getBentoItems, getSettings } from '@/lib/data'
import HeroSlider from '@/components/HeroSlider'
import ProductGrid from '@/components/ProductGrid'
import ProductMarquee from '@/components/ProductMarquee'
import ReviewsCarousel from '@/components/ReviewsCarousel'
import { BentoItem } from '@/lib/types'

export const metadata: Metadata = {
  title: 'ADONIS STORE',
  description: 'Exquisite jewelry for the modern era',
  icons: {
    icon: [
      { url: '/icon.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/favicon.png',
  },
}

export const revalidate = 60

const MARQUEE_ITEMS = [
  'Alta Joyería', 'Colección 2025', 'Piezas Únicas', 'Oro & Diamantes',
  'Artesanía', 'Exclusivo', 'Alta Joyería', 'Colección 2025',
]

const VALUES_ITEMS = [
  { icon: 'local_shipping', label: 'Envíos a todo el país', desc: 'Cobertura nacional garantizada.' },
  { icon: 'credit_card', label: 'Pago contra entrega', desc: 'Pagá recién cuando recibas tu pedido (Zona Central).' },
  { icon: 'verified_user', label: 'Garantía de cambio', desc: 'Cambios sin vueltas hasta 72 horas después de la compra.' },
  { icon: 'star', label: 'Compra 100% protegida', desc: 'Soporte personalizado vía WhatsApp.' },
]

export default async function HomePage() {
  const [products, categories, heroes, reviews, bentoItems, settings] = await Promise.all([
    getProducts(), getCategories(), getHeroes(), getReviews(), getBentoItems(), getSettings()
  ])

  const heroesWithFallback = heroes.length > 0 ? heroes : [{
    id: 'fallback',
    title: 'Precisión Etérea',
    subtitle: 'Exposición Otoño 2024',
    image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCX4fcGpro-61J08xXiI120AJgqENago4dghMd43ASTL3OyoAJMDTLCe5diosL5RKo4tOJFvrq5H1ieGlYfpQT-_qCNSHvMNazRmycKcqh3yZ7WDwFZnNi-_gP0VPLMTbzrTBqHOLzZRpdrLouJv51yr19ZPdsFT1YmW2LzGwTN41UuzMU4MFgCKVu_qF6vOLSF7gBgkBCkM1ZO92sMaDegzGnlid0vgtQ__sj8v9K-TbK4Mep63MNVqdyvzt5OerKjMNvKmBVXCPKx',
    cta_text: 'Explorar Colección',
    cta_url: '/products',
  }]

  const rootCategories = categories.filter(c => !c.parent_id && !c.parentId)
  
  const DESIRED_ORDER = ['pulseras', 'cadenas', 'billeteras']
  const orderedCategories = [...rootCategories].sort((a, b) => {
    const aName = a.name.toLowerCase()
    const bName = b.name.toLowerCase()
    const aIdx = DESIRED_ORDER.indexOf(aName)
    const bIdx = DESIRED_ORDER.indexOf(bName)
    if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx
    if (aIdx !== -1) return -1
    if (bIdx !== -1) return 1
    return (a.sort_order || 0) - (b.sort_order || 0)
  })

  let featuredProducts = products.filter(p => p.featured)
  // Fallback si no hay destacados, mostrar los 10 primeros
  if (featuredProducts.length === 0) {
    featuredProducts = products.slice(0, 10)
  }

  return (
    <>
      <Navbar />
      <main className="bg-background text-on-background font-body">

        {/* Spacer for fixed navbar */}
        <div className="h-20 md:h-24" />
        {/* ── Hero Slider ─────────────────────────────────────── */}
        <HeroSlider heroes={heroesWithFallback} />

        {/* ── Animated Values Marquee ─────────────────────────── */}
        <div className="border-b border-outline-variant/10 py-5 overflow-hidden bg-surface-container-lowest/50" aria-hidden="true">
          <div className="marquee-track flex" style={{ animationDuration: '40s' }}>
            {[0, 1].map(copy => (
              <div key={copy} className="flex gap-16 md:gap-24 px-8 items-center flex-shrink-0">
                {VALUES_ITEMS.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 min-w-[280px]">
                    <div className="w-10 h-10 rounded-full border border-neutral-800 flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-[18px] text-neutral-400">{item.icon}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <p className="text-[9px] uppercase tracking-[0.2em] text-white font-bold">{item.label}</p>
                      <p className="text-[10px] text-neutral-500 font-light">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ── Featured Products ─────────────────────────────────── */}
        {featuredProducts.length > 0 && (
          <section className="py-12 px-6 md:px-12">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-end justify-between mb-10">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.45em] text-secondary font-bold mb-3">Colección</p>
                  <h2 className="font-headline text-3xl md:text-4xl text-white uppercase tracking-tight">
                    Productos Destacados
                  </h2>
                </div>
                <Link
                  href="/products"
                  className="hidden md:flex items-center gap-2 text-[9px] uppercase tracking-[0.3em] text-neutral-500 hover:text-white transition-colors font-bold group"
                >
                  Ver todo
                  <span className="material-symbols-outlined text-sm group-hover:translate-x-0.5 transition-transform" aria-hidden="true">
                    arrow_forward
                  </span>
                </Link>
              </div>

              <div className="-mx-6 md:-mx-12">
                <ProductMarquee products={featuredProducts.slice(0, 5)} reverse={true} />
              </div>

              <div className="mt-12 flex justify-center md:hidden">
                <Link
                  href="/products"
                  className="text-[10px] uppercase tracking-widest text-neutral-400 hover:text-white font-bold border-b border-neutral-700 hover:border-white pb-1 transition-all"
                >
                  Ver toda la colección
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* ── Dynamic Category Sections ─────────────────────────── */}
        {orderedCategories.map((category) => {
          const categoryProducts = products.filter(p => {
            const pid = (p as any).category_id ?? p.categoryId
            if (pid === category.id) return true
            return categories.some(
              child => (child.parent_id ?? child.parentId) === category.id && pid === child.id
            )
          }).slice(0, 4)

          if (categoryProducts.length === 0) return null

          return (
            <section
              key={category.id}
              className="py-8 px-6 md:px-12 border-t border-outline-variant/10"
            >
              <div className="max-w-7xl mx-auto">
                <div className="flex items-end justify-between mb-8">
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.45em] text-secondary font-bold mb-3">Categoría</p>
                    <h2 className="font-headline text-2xl md:text-3xl text-white uppercase tracking-tight">{category.name}</h2>
                  </div>
                  <Link
                    href={`/products?category=${category.slug}`}
                    className="hidden md:flex items-center gap-2 text-[9px] uppercase tracking-[0.3em] text-neutral-500 hover:text-white transition-colors font-bold group"
                  >
                    Ver Todo
                    <span className="material-symbols-outlined text-sm group-hover:translate-x-0.5 transition-transform" aria-hidden="true">
                      arrow_forward
                    </span>
                  </Link>
                </div>

                <div className="-mx-6 md:-mx-12">
                  <ProductMarquee products={categoryProducts} reverse={true} />
                </div>
              </div>
            </section>
          )
        })}

        {/* ── Bento Grid — Explorar Categorías (from admin) ─────── */}
        {bentoItems.length > 0 && (
          <BentoGrid items={bentoItems} />
        )}

        {/* ── Reviews ───────────────────────────────────────────── */}
        <ReviewsCarousel reviews={reviews} />



      </main>
      <Footer />
    </>
  )
}

/* ── Categories Grid (Formerly Bento) ───────────────────────── */
function BentoGrid({ items }: { items: BentoItem[] }) {
  return (
    <section className="py-16 pt-8 px-6 md:px-12 bg-neutral-950">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-6">
          <h2 className="font-headline text-2xl md:text-3xl text-white tracking-wide font-bold uppercase">Categorías</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[250px] md:auto-rows-[300px]">
          {items.map((item) => {
            return (
              <Link
                key={item.id}
                href={item.link_url ?? '/products'}
                className="group relative overflow-hidden rounded-md border border-neutral-800/80 hover:border-neutral-500 transition-all duration-500"
              >
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.title}
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 to-neutral-950 group-hover:from-neutral-800 transition-all duration-500" />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                <div className="absolute inset-0 flex flex-col justify-end p-5 md:p-6 pb-6">
                  <div className="flex flex-col gap-1.5">
                    <h3 className="font-headline uppercase tracking-tight text-white leading-tight text-xl md:text-2xl font-bold">
                      {item.title}
                    </h3>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white font-bold group-hover:text-neutral-300 transition-colors">
                      {item.subtitle || 'VER COLECCIÓN'}
                    </p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
