import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { getProductBySlug, getProducts, formatPrice } from '@/lib/data'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import ProductClientActions from './ProductClientActions'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const products = await getProducts()
  return products.map((p) => ({
    slug: p.slug,
  }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  return {
    title: product ? `${product.name} | ADONIS` : 'Producto no encontrado',
    description: product?.description || 'Pieza exclusiva de Adonis Jewelry',
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) notFound()

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background text-on-background pt-32 pb-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumbs */}
          <nav className="mb-12 flex items-center gap-2 text-[10px] uppercase tracking-widest text-neutral-500 font-bold">
            <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <Link href="/products" className="hover:text-white transition-colors">Colección</Link>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-neutral-400">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24 items-start">
            {/* Gallery */}
            <div className="space-y-4 md:sticky md:top-32">
              <div className="bg-surface-container-low aspect-[3/4] flex items-center justify-center relative overflow-hidden border border-outline-variant/10">
                {product.images?.[0] ? (
                  <div className="relative w-full h-full">
                    <Image 
                      src={product.images[0]} 
                      alt={product.name} 
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                ) : (
                  <div className="text-center p-12">
                    <span className="material-symbols-outlined text-6xl text-neutral-800 mb-4 block">diamond</span>
                    <p className="font-headline text-neutral-600 font-bold uppercase tracking-widest text-[10px]">Archivo de Obra Maestra</p>
                  </div>
                )}
              </div>
              
              {/* Thumbnails if any */}
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-4">
                  {product.images.slice(1).map((img, i) => (
                    <div key={i} className="bg-surface-container-low aspect-square border border-outline-variant/10 overflow-hidden relative">
                      <Image 
                        src={img} 
                        alt={`${product.name} detail`} 
                        fill
                        className="object-cover opacity-60 hover:opacity-100 transition-opacity" 
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="flex flex-col gap-10">
              <div className="border-b border-outline-variant/10 pb-10">
                <p className="font-label text-xs uppercase tracking-[0.4em] text-secondary font-bold mb-4">
                  {product.material || 'Alta Joyería'}
                </p>
                <h1 className="font-headline text-5xl md:text-6xl text-white uppercase tracking-tight leading-none mb-6">
                  {product.name}
                </h1>
                <div className="flex items-baseline gap-4">
                  <p className="font-sans text-3xl text-primary-container font-light">
                    {formatPrice(product.price)}
                  </p>
                  {product.originalPrice && (
                    <p className="text-lg text-neutral-600 line-through font-light">
                      {formatPrice(product.originalPrice)}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-8">
                <div className="space-y-4 uppercase">
                   <p className="text-[10px] tracking-[0.3em] text-neutral-500 font-bold">Exploración Artística</p>
                   <p className="font-body text-neutral-300 leading-relaxed text-lg font-light lowercase first-letter:uppercase">
                    {product.description || 'Una pieza exquisita que equilibra la tradición artesanal con el minimalismo contemporáneo. Forjada con los materiales más nobles para perdurar como un legado.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-12 py-10 border-t border-b border-outline-variant/10">
                  <div className="space-y-3">
                    <p className="text-[9px] uppercase tracking-widest text-neutral-500 font-bold">Identificador</p>
                    <p className="text-white font-headline text-sm uppercase tracking-wider">AD-26-{product.id.slice(0, 4)}</p>
                  </div>
                  <div className="space-y-3">
                    <p className="text-[9px] uppercase tracking-widest text-neutral-500 font-bold">Artesanía</p>
                    <p className="text-white font-headline text-sm uppercase tracking-wider">{product.material || 'Oro 18K'}</p>
                  </div>
                  <div className="space-y-3">
                    <p className="text-[9px] uppercase tracking-widest text-neutral-500 font-bold">Disponibilidad</p>
                    <p className={`font-headline text-sm uppercase tracking-wider ${(product.stock ?? 0) > 0 ? 'text-emerald-400' : 'text-error'}`}>
                      {(product.stock ?? 0) > 0 ? 'Pieza Disponible' : 'Bajo Pedido'}
                    </p>
                  </div>
                  <div className="space-y-3">
                    <p className="text-[9px] uppercase tracking-widest text-neutral-500 font-bold">Colección</p>
                    <p className="text-white font-headline text-sm uppercase tracking-wider">Adonis Legacy</p>
                  </div>
                </div>
              </div>

              {/* Client Component for Interactive Actions */}
              <ProductClientActions product={product} />

              <div className="pt-8 flex flex-col gap-6">
                <div className="flex items-center gap-4 text-neutral-500 uppercase tracking-[0.2em] text-[8px] font-bold">
                  <span className="material-symbols-outlined text-sm">local_shipping</span>
                  <span>Envío asegurado a todo el país</span>
                </div>
                <div className="flex items-center gap-4 text-neutral-500 uppercase tracking-[0.2em] text-[8px] font-bold">
                  <span className="material-symbols-outlined text-sm">verified</span>
                  <span>Certificado de autenticidad incluido</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
