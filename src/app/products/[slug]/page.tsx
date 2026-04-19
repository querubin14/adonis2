import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { getProductBySlug, getProducts, formatPrice } from '@/lib/data'
import { notFound } from 'next/navigation'
import Link from 'next/link'
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
      <main className="min-h-screen bg-white text-black pt-28 pb-20 px-6 md:px-12 font-sans">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-10 md:gap-16 items-start">
            {/* Gallery (Client Component) */}
            <div className="w-full lg:w-1/2">
              <ProductGallery images={product.images || []} name={product.name} />
            </div>

            {/* Details */}
            <div className="w-full lg:w-1/2 flex flex-col pt-2">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-3">
                ADONIS ACCESORIOS
              </p>
              <h1 className="text-3xl md:text-4xl text-black leading-tight mb-4 tracking-tight">
                {product.name}
              </h1>
              
              <p className="text-xl text-black mb-3">
                {formatPrice(product.price)}
              </p>
              <p className="text-xs text-gray-600 mb-8">
                Los <span className="underline cursor-help">gastos de envío</span> se calculan en la pantalla de pago.
              </p>

              {/* Client Component for Interactive Actions (Qty, Buttons) */}
              <ProductClientActions product={product} />

              <div className="mt-10 space-y-4 text-[13px] text-gray-800 leading-relaxed">
                <p>
                  <strong>• Material:</strong> {product.material || 'Acero Inoxidable'}. Duradero, resistente y de fácil mantenimiento. Hipoalergénico, apto para pieles sensibles.
                </p>
                <p>
                  <strong>• Longitud:</strong> 45 cm
                </p>
                <p>
                  <strong>• Grosor:</strong> 4 mm
                </p>
              </div>

              <button className="mt-8 flex items-center gap-2 text-sm text-gray-600 hover:text-black transition-colors w-fit">
                <span className="material-symbols-outlined text-[18px]">ios_share</span>
                Compartir
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

