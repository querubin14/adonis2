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
  const allProducts = await getProducts()
  
  // Get some recommendations (excluding current product)
  const recommendations = allProducts
    .filter(p => p.id !== product?.id)
    .sort(() => 0.5 - Math.random())
    .slice(0, 3)

  if (!product) notFound()

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background text-white pt-28 pb-20 px-6 md:px-12 font-sans">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-10 md:gap-16 items-start">
            {/* Gallery (Client Component) */}
            <div className="w-full lg:w-1/2">
              <ProductGallery images={product.images || []} name={product.name} />
            </div>

            {/* Details */}
            <div className="w-full lg:w-1/2 flex flex-col pt-2">
              <p className="text-[10px] text-neutral-500 uppercase tracking-widest mb-3 font-bold">
                ADONIS ACCESORIOS
              </p>
              <h1 className="text-3xl md:text-3.5xl text-white leading-tight mb-4 tracking-tight font-bold uppercase">
                {product.name}
              </h1>
              
              <p className="text-xl text-white mb-3 font-medium">
                {formatPrice(product.price)}
              </p>
              <p className="text-[11px] text-neutral-500 mb-8">
                Los <span className="underline cursor-help">gastos de envío</span> se calculan en la pantalla de pago.
              </p>

              {/* Client Component for Interactive Actions (Qty, Buttons) */}
              <ProductClientActions product={product} />

              <div className="mt-10 space-y-4 text-[13px] text-neutral-300 leading-relaxed border-t border-white/5 pt-8">
                <p>
                  <strong className="text-white">• Material:</strong> {product.material || 'Acero Inoxidable'}. Duradero, resistente y de fácil mantenimiento. Hipoalergénico, apto para pieles sensibles.
                </p>
                {product.length && (
                  <p>
                    <strong className="text-white">• Longitud:</strong> {product.length}
                  </p>
                )}
                {product.thickness && (
                  <p>
                    <strong className="text-white">• Grosor:</strong> {product.thickness}
                  </p>
                )}
              </div>

              <button className="mt-8 flex items-center gap-2 text-[10px] uppercase tracking-widest text-neutral-500 hover:text-white transition-colors w-fit font-bold">
                <span className="material-symbols-outlined text-[16px]">share</span>
                Compartir
              </button>
            </div>
          </div>

          {/* Recommendations Section */}
          <div className="mt-20 border-t border-white/5 pt-12 max-w-4xl mx-auto lg:mx-0">
            <div className="flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-white text-[14px]">grade</span>
              <h2 className="text-[10px] uppercase tracking-[0.2em] text-white font-bold">Recomendaciones</h2>
            </div>

            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
              {recommendations.slice(0, 4).map((item) => (
                <Link key={item.id} href={`/products/${item.slug}`} className="group block">
                  <div className="aspect-square relative overflow-hidden bg-neutral-900 border border-white/5 mb-2">
                    <Image 
                      src={item.images?.[0] || '/placeholder.png'} 
                      alt={item.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                  <h3 className="text-[8px] uppercase tracking-wider text-white font-bold mb-0.5 truncate leading-tight">
                    {item.name}
                  </h3>
                  <p className="text-[8px] text-neutral-500 font-medium">
                    {formatPrice(item.price)}
                  </p>
                </Link>
              ))}
            </div>

            <div className="mt-8">
              <Link 
                href="/products" 
                className="block w-full border border-white/10 py-2.5 text-center text-[9px] uppercase tracking-[0.15em] text-neutral-500 hover:text-white hover:border-white/20 transition-all font-bold"
              >
                Ver más opciones
              </Link>
            </div>
          </div>

          {/* Trust Section */}
          <div className="mt-16 space-y-3 pt-8 border-t border-white/5">
            <div className="flex items-center gap-2 text-[11px] text-neutral-400">
              <div className="w-4 h-4 rounded-full bg-green-500/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-green-500 text-[12px] font-bold">check</span>
              </div>
              <span>Envío gratis en compras mayores a 500.000 Gs</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-neutral-400">
              <div className="w-4 h-4 rounded-full bg-green-500/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-green-500 text-[12px] font-bold">check</span>
              </div>
              <span>Devoluciones gratis hasta 30 días</span>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}


