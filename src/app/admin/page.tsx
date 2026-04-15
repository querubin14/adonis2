'use client'

import { useState, useEffect } from 'react'
import { getCategories, getProducts, insertProduct, formatPrice } from '@/lib/data'
import { Product, Category } from '@/lib/types'
import { CldUploadWidget } from 'next-cloudinary'

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<string[]>([])

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    categoryId: '',
    material: '',
    description: '',
    stock: '',
    slug: ''
  })

  useEffect(() => {
    async function init() {
      try {
        const [cats, prods] = await Promise.all([getCategories(), getProducts()])
        setCategories(cats)
        setProducts(prods)
      } catch (err) {
        console.error('Error loading admin data:', err)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => {
        const updated = { ...prev, [name]: value }
        if (name === 'name') {
            updated.slug = value.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')
        }
        return updated
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (uploadedImages.length === 0) {
      if (!confirm('¿Seguro que desea guardar sin imágenes?')) return
    }
    setSubmitting(true)
    try {
      await insertProduct({
        ...formData,
        price: parseInt(formData.price),
        stock: parseInt(formData.stock),
        images: uploadedImages
      } as any)
      
      setFormData({ name: '', price: '', categoryId: '', material: '', description: '', stock: '', slug: '' })
      setUploadedImages([])
      const prods = await getProducts()
      setProducts(prods)
      alert('Producto registrado con éxito.')
    } catch (err: any) {
      alert('Error al registrar: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-background text-on-background font-body">
      {/* SIDEBAR */}
      <aside className="h-screen w-64 fixed left-0 top-0 bg-neutral-900 flex flex-col p-6 z-50 border-r border-neutral-800/30">
        <div className="mb-12">
          <h1 className="font-headline text-lg tracking-widest text-white uppercase">ADONIS ADMIN</h1>
          <p className="text-[10px] tracking-widest text-neutral-500 uppercase mt-1 font-medium">Bóveda de Control</p>
        </div>
        <nav className="flex flex-col gap-2 flex-grow">
          {['Panel Control', 'Inventario', 'Categorías', 'Pedidos'].map((item, idx) => (
            <a key={item} href="#" className={`flex items-center gap-4 px-4 py-3 transition-all font-sans tracking-tight text-sm uppercase ${idx === 1 ? 'bg-white text-neutral-950 font-bold' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'}`}>
              <span className="material-symbols-outlined">{['dashboard', 'diamond', 'account_tree', 'shipping'][idx]}</span>
              <span>{item}</span>
            </a>
          ))}
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="ml-64 flex-grow p-12 overflow-x-hidden">
        <header className="mb-16 flex justify-between items-end">
          <div>
            <h2 className="font-headline text-4xl tracking-tight text-white mb-2 uppercase">Gestión de Inventario</h2>
            <p className="text-on-surface-variant max-w-lg font-light leading-relaxed">Conexión con Archivo Cloudinary activa.</p>
          </div>
        </header>

        <div className="grid grid-cols-12 gap-12">
          <section className="col-span-12 bg-surface-container-low/30 border border-outline-variant/10 p-10">
            <h3 className="font-headline text-xl text-white mb-10 uppercase tracking-widest border-b border-outline-variant/20 pb-4">Registrar Nueva Pieza</h3>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              {/* Data Fields */}
              <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] tracking-[0.2em] text-neutral-500 uppercase mb-2 font-bold">Nomenclatura (Nombre)</label>
                    <input name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-transparent border-0 border-b border-neutral-800 text-white text-lg font-headline placeholder:text-neutral-700 focus:ring-0 focus:border-white px-0 py-3" placeholder="Celestial Orbit Ring" required />
                  </div>
                  <div>
                    <label className="block text-[10px] tracking-[0.2em] text-neutral-500 uppercase mb-2 font-bold">Categoría</label>
                    <select name="categoryId" value={formData.categoryId} onChange={handleInputChange} className="w-full bg-transparent border-0 border-b border-neutral-800 text-white text-sm focus:ring-0 focus:border-white px-0 py-3" required>
                      <option value="" className="bg-neutral-900">Seleccionar...</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id} className="bg-neutral-900">{cat.parentId ? '--- ' : ''}{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] tracking-[0.2em] text-neutral-500 uppercase mb-2 font-bold">Valuación (Gs.)</label>
                    <input name="price" type="number" value={formData.price} onChange={handleInputChange} className="w-full bg-transparent border-0 border-b border-neutral-800 text-white text-lg font-headline placeholder:text-neutral-700 focus:ring-0 focus:border-white px-0 py-3" placeholder="0" required />
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] tracking-[0.2em] text-neutral-500 uppercase mb-2 font-bold">Materiales</label>
                    <input name="material" value={formData.material} onChange={handleInputChange} className="w-full bg-transparent border-0 border-b border-neutral-800 text-white text-sm focus:ring-0 focus:border-white px-0 py-3" placeholder="Oro, Piedras..." />
                  </div>
                  <div>
                    <label className="block text-[10px] tracking-[0.2em] text-neutral-500 uppercase mb-2 font-bold">Stock</label>
                    <input name="stock" type="number" value={formData.stock} onChange={handleInputChange} className="w-full bg-transparent border-0 border-b border-neutral-800 text-white text-lg font-headline focus:ring-0 focus:border-white px-0 py-3" placeholder="1" required />
                  </div>
                  <div>
                    <label className="block text-[10px] tracking-[0.2em] text-neutral-500 uppercase mb-2 font-bold">Descripción</label>
                    <textarea name="description" value={formData.description} onChange={handleInputChange} className="w-full bg-transparent border border-neutral-800 text-white text-sm font-light p-4 focus:border-white focus:ring-0 resize-none" rows={3} placeholder="Mística de la pieza..." />
                  </div>
                </div>
              </div>

              {/* Image Upload Column */}
              <div className="lg:col-span-4 space-y-6">
                <label className="block text-[10px] tracking-[0.2em] text-neutral-500 uppercase mb-2 font-bold">Multimedia de Archivo (Cloudinary)</label>
                
                <CldUploadWidget 
                  uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                  onSuccess={(result: any) => {
                    if (result.info && result.info.secure_url) {
                      setUploadedImages(prev => [...prev, result.info.secure_url])
                    }
                  }}
                >
                  {({ open }) => (
                    <button 
                      type="button"
                      onClick={() => open()}
                      className="w-full aspect-[4/3] border-2 border-dashed border-neutral-800 hover:border-white transition-all flex flex-col items-center justify-center gap-4 group"
                    >
                      <span className="material-symbols-outlined text-4xl text-neutral-600 group-hover:text-white">upload_file</span>
                      <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold group-hover:text-white">Subir desde PC</p>
                    </button>
                  )}
                </CldUploadWidget>

                <div className="grid grid-cols-4 gap-2">
                  {uploadedImages.map((url, i) => (
                    <div key={i} className="aspect-square bg-neutral-900 border border-neutral-800 relative group">
                      <img src={url} alt="Preview" className="w-full h-full object-cover" />
                      <button 
                        type="button" 
                        onClick={() => setUploadedImages(prev => prev.filter((_, idx) => idx !== i))}
                        className="absolute top-0 right-0 bg-black/80 text-white p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                         <span className="material-symbols-outlined text-xs">close</span>
                      </button>
                    </div>
                  ))}
                </div>

                <button disabled={submitting} className="w-full bg-white text-black py-5 text-xs font-bold tracking-[0.3em] uppercase hover:bg-neutral-200 transition-all disabled:opacity-50 mt-4" type="submit">
                  {submitting ? 'Guardando...' : 'Confirmar Registro'}
                </button>
              </div>
            </form>
          </section>

          {/* LIST */}
          <section className="col-span-12 mt-12">
            <h3 className="font-headline text-xl text-white mb-8 uppercase tracking-widest border-b border-outline-variant/20 pb-4">Inventario Actual</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                <p className="text-neutral-600 italic text-xs">Accediendo...</p>
              ) : products.map(product => (
                <div key={product.id} className="bg-surface-container-low p-6 flex items-center gap-6 group hover:border-white border border-transparent transition-all">
                   <div className="w-16 h-20 bg-neutral-900 border border-neutral-800 flex items-center justify-center overflow-hidden">
                     {product.images && product.images[0] ? (
                       <img src={product.images[0]} className="w-full h-full object-cover" />
                     ) : (
                       <span className="material-symbols-outlined text-neutral-700 text-sm">diamond</span>
                     )}
                   </div>
                   <div className="flex-grow">
                      <p className="text-[10px] text-neutral-500 uppercase font-bold">{formatPrice(product.price)}</p>
                      <h4 className="font-headline text-white text-sm group-hover:text-primary transition-colors">{product.name}</h4>
                   </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
