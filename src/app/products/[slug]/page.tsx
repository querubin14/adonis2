import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { MOCK_PRODUCTS, formatPrice } from '@/lib/data'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return MOCK_PRODUCTS.map((p) => ({
    slug: p.slug,
  }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = MOCK_PRODUCTS.find((p) => p.slug === slug)
  return {
    title: product ? `${product.name} | ADONIS` : 'Producto no encontrado',
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params
  const product = MOCK_PRODUCTS.find((p) => p.slug === slug)

  if (!product) notFound()

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background text-on-background pt-32 pb-20 px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
          {/* Gallery Placeholder */}
          <div className="space-y-4 sticky top-32">
            <div className="bg-surface p-20 aspect-square flex items-center justify-center relative">
               <div className="w-full h-full bg-neutral-800 opacity-20 absolute inset-0" />
               <p className="font-headline text-neutral-600 font-bold uppercase tracking-widest text-[10px]">Archivo de Obra Maestra</p>
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-col gap-12">
            <div>
              <span className="font-label text-xs uppercase tracking-[0.4em] text-secondary font-bold">{product.category}</span>
              <h1 className="font-headline text-5xl md:text-7xl mt-4 mb-6 text-white uppercase tracking-tight">{product.name}</h1>
              <p className="font-sans text-2xl text-primary-container mb-8 font-light">{formatPrice(product.price)}</p>
              <div className="w-20 h-px bg-primary" />
            </div>

            <div className="space-y-6">
              <p className="font-body text-neutral-400 leading-relaxed text-lg font-light">
                Excelencia Forjada a Mano. Esta pieza del archivo de {product.category} captura la esencia de {product.material} con una precisión que desafía lo etéreo.
              </p>
              <div className="grid grid-cols-2 gap-8 py-8 border-t border-b border-outline-variant/20">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-neutral-500 mb-2 font-bold">Ref. de Archivo</p>
                  <p className="text-white font-headline text-sm uppercase">ADO-ARCH-{product.id}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-neutral-500 mb-2 font-bold">Material</p>
                  <p className="text-white font-headline text-sm uppercase">{product.material}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <button className="w-full bg-primary text-on-primary py-6 font-label uppercase tracking-widest text-xs hover:bg-neutral-200 transition-all font-bold">
                Añadir a la Colección
              </button>
              <button className="w-full border border-neutral-800 text-white py-6 font-label uppercase tracking-widest text-xs hover:border-white transition-all font-bold">
                Solicitar Ajuste a Medida
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
