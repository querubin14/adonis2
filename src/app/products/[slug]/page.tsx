import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { getProductBySlug, getProducts, formatPrice, getSettings } from '@/lib/data'
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
  const [recommendationsData, settings] = await Promise.all([
    getProducts().then(all => all.filter(p => p.id !== product?.id).sort(() => 0.5 - Math.random()).slice(0, 3)),
    getSettings()
  ])
  const recommendations = recommendationsData

  if (!product) notFound()

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background text-white pt-28 pb-20 px-6 md:px-12 font-sans">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-10 md:gap-16 items-start">
            {/* Gallery (Client Component) */}
            <div className="w-full lg:w-[42%]">
              <ProductGallery images={product.images || []} name={product.name} />
            </div>

            {/* Details */}
            <div className="w-full lg:w-[58%] flex flex-col pt-0 pl-0 lg:pl-6">
              <h1 className="text-2xl md:text-3xl text-white leading-tight mb-2 tracking-tight font-bold uppercase">
                {product.name}
              </h1>
              
              <p className="text-lg text-white mb-2 font-medium">
                {formatPrice(product.price)}
              </p>
              <p className="text-[10px] text-neutral-500 mb-4">
                Los <span className="underline cursor-help">gastos de envío</span> se calculan en la pantalla de pago.
              </p>

              {/* Low Stock Badge (Image 2) */}
              {product.stock <= 5 && product.stock > 0 && (
                <div className="flex items-center gap-2 mb-6 text-[8px] uppercase tracking-[0.1em] font-bold text-orange-500 bg-orange-500/5 px-2 py-1 w-fit rounded-full border border-orange-500/20">
                  <span className="w-1 h-1 rounded-full bg-orange-500 animate-pulse" />
                  BAJAS EXISTENCIAS: QUEDAN {product.stock}
                </div>
              )}

              {/* Client Component for Interactive Actions (Qty, Buttons, Variations) */}
              <ProductClientActions product={product} whatsappNumber={settings?.whatsapp_number} />

              <div className="mt-8 space-y-4 text-[12px] text-neutral-300 leading-relaxed border-t border-white/5 pt-8">
                {product.description ? (
                  <div className="whitespace-pre-line text-neutral-400 text-xs">
                    {product.description}
                  </div>
                ) : (
                  <p className="text-xs">
                    <strong className="text-white">• Material:</strong> {product.material || 'Acero Inoxidable'}. Duradero, resistente y de fácil mantenimiento. Hipoalergénico, apto para pieles sensibles.
                  </p>
                )}
                
                <div className="flex flex-col gap-1 mt-2 text-xs">
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
              </div>

              {/* Recommendations & Delivery Grid */}
              <div className="mt-8 border-t border-white/5 pt-8 grid grid-cols-2 gap-8">
                {/* Recommendations */}
                <div className="border-r border-white/5 pr-8">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-white text-[12px]">grade</span>
                    <h2 className="text-[9px] uppercase tracking-[0.2em] text-white font-bold">Recomendaciones</h2>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {recommendations.slice(0, 2).map((item) => (
                      <Link key={item.id} href={`/products/${item.slug}`} className="group block">
                        <div className="aspect-square relative overflow-hidden bg-neutral-900 border border-white/5 mb-1.5">
                          <Image 
                            src={item.images?.[0] || '/placeholder.png'} 
                            alt={item.name}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        </div>
                        <h3 className="text-[7px] uppercase tracking-wider text-white font-bold mb-0.5 truncate">
                          {item.name}
                        </h3>
                      </Link>
                    ))}
                  </div>
                  <Link href="/products" className="mt-3 block text-[8px] uppercase tracking-widest text-neutral-500 hover:text-white transition-colors font-bold border border-white/10 py-1 text-center">
                    Ver más
                  </Link>
                </div>

                {/* Delivery Info */}
                <div>
                  <h3 className="text-[9px] uppercase tracking-[0.25em] text-white font-bold mb-5">ENTREGA ESTIMADA</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-[11px] text-white font-bold mb-0.5">Asunción y alrededores</p>
                      <p className="text-[10px] text-neutral-500 leading-tight">{settings?.shipping_asuncion_text || 'Menos de 24 hrs.'}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-white font-bold mb-0.5">Envíos al interior</p>
                      <p className="text-[10px] text-neutral-500 leading-tight">{settings?.shipping_interior_text || '24 a 48 hrs.'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <button className="mt-8 flex items-center gap-2 text-[9px] uppercase tracking-widest text-neutral-500 hover:text-white transition-colors w-fit font-bold group">
                <span className="material-symbols-outlined text-[14px] group-hover:scale-110 transition-transform">share</span>
                Compartir pieza
              </button>
            </div>
          </div>


          {/* Trust Section */}
          <div className="mt-12 pt-6 border-t border-white/5 flex flex-row flex-wrap gap-x-8 gap-y-3">
            {settings?.shipping_text && (
              <div className="flex items-center gap-2 text-[10px] text-neutral-500 font-medium">
                <span className="material-symbols-outlined text-green-500 text-[14px]">check_circle</span>
                <span>{settings.shipping_text}</span>
              </div>
            )}
            {settings?.returns_text && (
              <div className="flex items-center gap-2 text-[10px] text-neutral-500 font-medium">
                <span className="material-symbols-outlined text-green-500 text-[14px]">check_circle</span>
                <span>{settings.returns_text}</span>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}


