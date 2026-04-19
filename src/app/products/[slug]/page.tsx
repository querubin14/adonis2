import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { getProductBySlug, getProducts, formatPrice } from '@/lib/data'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import ProductClientActions from './ProductClientActions'

import ProductGallery from './ProductGallery'

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
    title: product ? `${product.name} | ADONIS STORE` : 'Producto no encontrado',
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
      <main className="min-h-screen bg-background text-on-background pt-28 pb-20 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumbs */}
          <nav className="mb-6 flex items-center gap-2 text-[8px] uppercase tracking-[0.3em] text-neutral-500 font-bold">
            <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
            <span className="material-symbols-outlined text-[10px]">chevron_right</span>
            <Link href="/products" className="hover:text-white transition-colors">Colección</Link>
            <span className="material-symbols-outlined text-[10px]">chevron_right</span>
            <span className="text-neutral-400 font-medium">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-20 items-start">
            {/* Gallery (Client Component) */}
            <div className="lg:col-span-5 max-w-[450px] mx-auto lg:mx-0 w-full">
              <ProductGallery images={product.images || []} name={product.name} />
            </div>

            {/* Details */}
            <div className="lg:col-span-7 flex flex-col gap-8">
              <div className="border-b border-white/5 pb-8">
                <p className="font-label text-[9px] uppercase tracking-[0.4em] text-neutral-500 font-bold mb-3">
                  ADONIS SELECTION
                </p>
                <h1 className="font-headline text-3xl md:text-3.5xl text-white uppercase tracking-tight leading-[1.1] mb-5 font-bold">
                  {product.name}
                </h1>
                <div className="flex flex-col gap-2">
                  <p className="font-sans text-xl text-white font-medium">
                    {formatPrice(product.price)}
                  </p>
                  <p className="text-[10px] text-neutral-500 font-medium">
                    Los <span className="underline cursor-help">gastos de envío</span> se calculan en la pantalla de pago.
                  </p>
                </div>
              </div>

              {/* Client Component for Interactive Actions (Qty, Buttons) */}
              <ProductClientActions product={product} />

              <div className="space-y-6 pt-2">
                <div className="space-y-4 uppercase">
                   <p className="font-body text-neutral-300 leading-relaxed text-[13px] font-normal lowercase first-letter:uppercase max-w-lg">
                    {product.description || 'Una pieza exquisita que equilibra la tradición artesanal con el minimalismo contemporáneo. Forjada con los materiales más nobles para perdurar como un legado.'}
                  </p>
                </div>

                <div className="space-y-4 pt-6 border-t border-white/5 text-[11px] text-neutral-300">
                  <div className="flex items-start gap-2">
                    <span className="text-white font-bold">• Material:</span>
                    <span>{product.material || 'Acero Inoxidable'}. Duradero, resistente y de fácil mantenimiento.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-white font-bold">• Estilo:</span>
                    <span>Minimalista contemporáneo, ideal para el uso diario.</span>
                  </div>
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
