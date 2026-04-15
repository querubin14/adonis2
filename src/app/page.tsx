import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { MOCK_PRODUCTS, MOCK_CATEGORIES, formatPrice } from '@/lib/data'

export const metadata: Metadata = {
  title: 'ADONIS GALLERY | Alta Joyería',
  description: 'Exposición Otoño 2024 - Precisión Etérea',
}

export default function HomePage() {
  const rootCategories = MOCK_CATEGORIES.filter(c => !c.parentId)

  return (
    <>
      <Navbar />
      <main className="bg-background text-on-background font-body">
        {/* Hero Section */}
        <section className="relative h-screen flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img 
              alt="Collar de diamantes de lujo" 
              className="w-full h-full object-cover opacity-60" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCX4fcGpro-61J08xXiI120AJgqENago4dghMd43ASTL3OyoAJMDTLCe5diosL5RKo4tOJFvrq5H1ieGlYfpQT-_qCNSHvMNazRmycKcqh3yZ7WDwFZnNi-_gP0VPLMTbzrTBqHOLzZRpdrLouJv51yr19ZPdsFT1YmW2LzGwTN41UuzMU4MFgCKVu_qF6vOLSF7gBgkBCkM1ZO92sMaDegzGnlid0vgtQ__sj8v9K-TbK4Mep63MNVqdyvzt5OerKjMNvKmBVXCPKx"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background"></div>
          </div>
          <div className="relative z-10 text-center px-6 max-w-5xl">
            <span className="font-label uppercase tracking-[0.4em] text-xs text-secondary mb-6 block">Exposición Otoño 2024</span>
            <h1 className="font-headline text-5xl md:text-8xl lg:text-9xl mb-8 leading-tight tracking-tight uppercase">Precisión <br/> Etérea</h1>
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 mt-12">
              <button className="px-12 py-4 bg-primary text-on-primary font-label uppercase text-sm tracking-widest hover:bg-neutral-200 transition-all font-bold">
                Explorar Colección
              </button>
            </div>
          </div>
        </section>

        {/* Dynamic Category Sections */}
        {rootCategories.map((category) => {
          const categoryProducts = MOCK_PRODUCTS.filter(p => 
             p.categoryId === category.id || 
             MOCK_CATEGORIES.some(child => child.parentId === category.id && p.categoryId === child.id)
          ).slice(0, 4)

          if (categoryProducts.length === 0) return null

          return (
            <section key={category.id} className="py-24 px-6 md:px-12 border-b border-outline-variant/10">
              <div className="flex justify-between items-end mb-12">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.4em] text-secondary font-bold mb-2">Categoría</p>
                  <h2 className="font-headline text-3xl md:text-4xl text-white uppercase tracking-tight">{category.name}</h2>
                </div>
                <Link 
                  href={`/products?category=${category.slug}`} 
                  className="text-[10px] uppercase tracking-widest text-white border-b border-white pb-1 font-bold hover:text-secondary hover:border-secondary transition-all"
                >
                  Ver Todo
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {categoryProducts.map((product) => (
                  <Link key={product.id} href={`/products/${product.slug}`} className="group flex flex-col">
                    <div className="bg-surface aspect-[3/4] flex items-center justify-center mb-6 relative overflow-hidden transition-colors group-hover:bg-surface-container">
                      <div className="w-full h-full bg-neutral-800 opacity-20 absolute inset-0 group-hover:opacity-10 transition-opacity" />
                      <div className="w-full h-full flex items-center justify-center text-[10px] tracking-widest text-neutral-600 font-bold uppercase p-8 text-center leading-relaxed">
                        Registro de Artefacto <br/> [ {product.id} ]
                      </div>
                      <button className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-on-primary p-2">
                        <span className="material-symbols-outlined text-sm">add</span>
                      </button>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-secondary font-medium">{product.material}</p>
                      <h4 className="font-headline text-base text-white group-hover:text-primary transition-colors uppercase tracking-tight">{product.name}</h4>
                      <p className="font-sans text-sm text-primary-container font-light">{formatPrice(product.price)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )
        })}

        {/* Bespoke Section */}
        <section className="relative h-[500px] flex items-center overflow-hidden">
          <div className="absolute inset-0">
            <img 
              alt="Estudio de joyero" 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuArZu1ZsnUwt0OuWi9Ywfq5R2ZrNgt_sliMMs_fNJNTGs-FCLWqEKNtDvJZhRe2YA8bA49Wrd7jjzceyFfbY3k5_LoCDP4R7epj11dWZSGbPAZFBrgXDfe_ukEd9BHor0sCPj_TNFjECNyy-fYO9zesa9-HvaexCKkeql_N3esBW_nLYR0HL3vp9icONmQU4mLDuJOslmYjYYMqIdgom3RJjksBOYGPE1mKzC7P5Py-z-b8fd_JvYb-duHIK_tMxjxwVjogvCdCY3po"
            />
            <div className="absolute inset-0 bg-neutral-950/70"></div>
          </div>
          <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 flex justify-end">
            <div className="bg-surface-bright/40 backdrop-blur-2xl p-12 md:p-16 max-w-lg border border-white/10">
              <h2 className="font-headline text-3xl mb-6 text-white uppercase tracking-tight">Comisionar un Legado</h2>
              <p className="font-body text-neutral-300 leading-relaxed mb-8 text-sm">
                Nuestros artesanos trabajan con usted para transformar historias personales en artefactos eternos. Desde la selección de gemas raras hasta el pulido manual final.
              </p>
              <button className="font-label uppercase tracking-widest text-[10px] border-b border-primary pb-2 hover:text-white transition-colors font-bold">
                Iniciar el Viaje
              </button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
