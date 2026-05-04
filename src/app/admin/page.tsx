'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  getCategories, getProducts,
  insertProduct, updateProduct, deleteProduct,
  formatPrice,
} from '@/lib/data'
import { Product, Category } from '@/lib/types'
import { CldUploadWidget } from 'next-cloudinary'
import AdminSidebar from '@/components/AdminSidebar'
import CategoryPicker from '@/components/CategoryPicker'

// ── Types ──────────────────────────────────────────────────────────
type View = 'inventory' | 'form'
interface Toast { message: string; type: 'success' | 'error' }

const EMPTY_FORM = {
  name: '', price: '', category_id: '', material: '',
  description: '', stock: '', slug: '', original_price: '', featured: false,
  rating: '5.0', reviews_count: '0', is_trending: false
}

// ── Helpers ────────────────────────────────────────────────────────
function getRootCategoryId(catId: string, categories: Category[]): string | null {
  let cur = categories.find(c => c.id === catId)
  while (cur) {
    const pid = cur.parent_id ?? cur.parentId
    if (!pid) return cur.id
    cur = categories.find(c => c.id === pid)
  }
  return null
}

function getCategoryName(catId: string | undefined, categories: Category[]): string {
  if (!catId) return '—'
  const cat = categories.find(c => c.id === catId)
  return cat?.name ?? '—'
}

function StockBadge({ stock }: { stock: number }) {
  if (stock === 0)
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-error/20 text-error text-[9px] font-bold uppercase tracking-wider">Sin Stock</span>
  if (stock <= 3)
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-900/30 text-yellow-400 text-[9px] font-bold uppercase tracking-wider">Bajo ({stock})</span>
  return <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-900/30 text-emerald-400 text-[9px] font-bold uppercase tracking-wider">Stock ({stock})</span>
}

// ── Main Page ──────────────────────────────────────────────────────
export default function AdminPage() {
  const [products, setProducts]       = useState<Product[]>([])
  const [categories, setCategories]   = useState<Category[]>([])
  const [loading, setLoading]         = useState(true)
  const [submitting, setSubmitting]   = useState(false)
  const [view, setView]               = useState<View>('inventory')
  const [editing, setEditing]         = useState<Product | null>(null)
  const [deleteId, setDeleteId]       = useState<string | null>(null)
  const [toast, setToast]             = useState<Toast | null>(null)
  const [images, setImages]           = useState<string[]>([])
  const [urlInput, setUrlInput]       = useState('')
  const [formData, setFormData]       = useState(EMPTY_FORM)
  const [activeGroup, setActiveGroup] = useState<string>('all')
  const [openGroups, setOpenGroups]   = useState<Set<string>>(new Set())
  const [search, setSearch]           = useState('')
  const [draggedId, setDraggedId]     = useState<string | null>(null)
  const [hasUnsavedOrder, setHasUnsavedOrder] = useState(false)
  const [savingOrder, setSavingOrder] = useState(false)
  const [variants, setVariants] = useState<ProductVariant[]>([])


  // ── Products grouped by root category ─────────────────────────
  const groups = useMemo(() => {
    const rootCats = categories.filter(c => !c.parent_id && !c.parentId)
    const map = new Map<string, { id: string; name: string; products: Product[]; icon?: string; color?: string; borderColor?: string }>()
    
    map.set('__featured__', { id: '__featured__', name: 'DESTACADOS', products: [], icon: 'star', color: 'text-orange-500', borderColor: 'border-orange-500/50' })
    rootCats.forEach(cat => map.set(cat.id, { id: cat.id, name: cat.name, products: [] }))
    map.set('__none__', { id: '__none__', name: 'Sin Categoría', products: [] })

    const sortedProducts = [...products].sort((a, b) => ((a as any).sort_order || 0) - ((b as any).sort_order || 0))

    sortedProducts.forEach(p => {
      if (p.featured) {
        map.get('__featured__')!.products.push(p)
      } else {
        const catId = (p as any).category_id ?? p.categoryId
        const rootId = catId ? (getRootCategoryId(catId, categories) ?? '__none__') : '__none__'
        const group = map.get(rootId) ?? map.get('__none__')!
        group.products.push(p)
      }
    })

    const DESIRED_ORDER = ['pulseras', 'cadenas', 'billeteras']
    return [...map.values()]
      .filter(g => g.products.length > 0)
      .sort((a, b) => {
        if (a.id === '__featured__') return -1
        if (b.id === '__featured__') return 1
        const aIdx = DESIRED_ORDER.indexOf(a.name.toLowerCase())
        const bIdx = DESIRED_ORDER.indexOf(b.name.toLowerCase())
        if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx
        if (aIdx !== -1) return -1
        if (bIdx !== -1) return 1
        return a.name.localeCompare(b.name)
      })
  }, [products, categories])

  // ── Stats ──────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:    products.length,
    inStock:  products.filter(p => (p.stock ?? 0) > 0).length,
    lowStock: products.filter(p => (p.stock ?? 0) > 0 && (p.stock ?? 0) <= 3).length,
    noStock:  products.filter(p => (p.stock ?? 0) === 0).length,
  }), [products])

  // ── Filtered display ───────────────────────────────────────────
  const displayGroups = useMemo(() => {
    const filtered = activeGroup === 'all' ? groups : groups.filter(g => g.id === activeGroup)
    if (!search.trim()) return filtered
    const q = search.toLowerCase()
    return filtered
      .map(g => ({ ...g, products: g.products.filter(p => p.name.toLowerCase().includes(q)) }))
      .filter(g => g.products.length > 0)
  }, [groups, activeGroup, search])

  // ── Data load ──────────────────────────────────────────────────
  const load = useCallback(async () => {
    try {
      const [cats, prods] = await Promise.all([getCategories(), getProducts()])
      setCategories(cats)
      setProducts(prods)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(t)
  }, [toast])

  // Init open groups
  useEffect(() => {
    if (groups.length) setOpenGroups(new Set(groups.map(g => g.id)))
  }, [groups.length])

  function msg(message: string, type: Toast['type']) { setToast({ message, type }) }

  function openNew(prefillCategoryId?: string) {
    setEditing(null)
    setFormData({ ...EMPTY_FORM, category_id: prefillCategoryId ?? '' })
    setVariants([])
    setImages([])
    setUrlInput('')
    setView('form')
  }

  function openEdit(p: Product) {
    setEditing(p)
    setFormData({
      name: p.name,
      price: String(p.price),
      category_id: (p as any).category_id ?? p.categoryId ?? '',
      material: p.material ?? '',
      description: p.description ?? '',
      stock: String(p.stock ?? ''),
      slug: p.slug,
      original_price: p.originalPrice ? String(p.originalPrice) : '',
      featured: p.featured ?? false,
      rating: String(p.rating || '5.0'),
      reviews_count: String(p.reviewsCount || '0'),
      is_trending: (p as any).is_trending || p.isTrending || false,
    })
    setVariants(p.variants ?? [])
    setImages(p.images ?? [])
    setUrlInput('')
    setView('form')
  }

  function cancelForm() {
    setEditing(null)
    setFormData(EMPTY_FORM)
    setVariants([])
    setImages([])
    setView('inventory')
  }

  function handleInput(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    setFormData(prev => {
      const next = { ...prev, [name]: type === 'checkbox' ? checked : value }
      if (name === 'name' && !editing)
        next.slug = value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
          .replace(/\s+/g, '-').replace(/[^\w-]+/g, '')
      return next
    })
  }

  function addUrl() {
    const u = urlInput.trim()
    if (!u) return
    try { new URL(u); setImages(p => [...p, u]); setUrlInput('') }
    catch { msg('URL inválida', 'error') }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload: any = {
        name: formData.name,
        slug: formData.slug,
        price: parseInt(formData.price),
        category_id: formData.category_id || null,
        material: formData.material || null,
        description: formData.description || null,
        stock: parseInt(formData.stock),
        images,
        // The following columns don't exist in the DB yet:
        // featured: formData.featured,
        // rating: parseFloat(formData.rating),
        // reviews_count: parseInt(formData.reviews_count),
        // is_trending: formData.is_trending,
        // variants,
        ...(formData.original_price ? { original_price: parseInt(formData.original_price) } : {}),
      }

      if (editing) {
        await updateProduct(editing.id, payload)
        msg('Producto actualizado.', 'success')
      } else {
        await insertProduct(payload)
        msg('Producto registrado.', 'success')
      }
      cancelForm()
      await load()
    } catch (e: any) {
      msg('Error: ' + (e.message ?? 'Inténtelo nuevamente.'), 'error')
    } finally { setSubmitting(false) }
  }

  async function handleDelete() {
    if (!deleteId) return
    try {
      await deleteProduct(deleteId)
      setProducts(p => p.filter(x => x.id !== deleteId))
      setDeleteId(null)
      msg('Producto eliminado.', 'success')
    } catch (e: any) { msg('Error: ' + e.message, 'error') }
  }

  function toggleGroup(id: string) {
    setOpenGroups(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  // ── Drag & Drop ────────────────────────────────────────────────
  function handleDragStart(e: React.DragEvent, id: string) {
    setDraggedId(id)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', id)
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  function handleDrop(e: React.DragEvent, targetId: string) {
    e.preventDefault()
    if (!draggedId || draggedId === targetId) return
    
    const dragIndex = products.findIndex(p => p.id === draggedId)
    const dropIndex = products.findIndex(p => p.id === targetId)
    if (dragIndex === -1 || dropIndex === -1) return

    setProducts(prev => {
      const next = [...prev]
      const [draggedItem] = next.splice(dragIndex, 1)
      const newDropIndex = next.findIndex(p => p.id === targetId)
      next.splice(newDropIndex, 0, draggedItem)
      // Actualizar sort_order localmente
      return next.map((p, i) => ({ ...p, sort_order: i } as Product))
    })
    setDraggedId(null)
    setHasUnsavedOrder(true)
  }

  async function saveOrder() {
    msg('Funcionalidad de orden desactivada (falta columna sort_order)', 'error')
    setHasUnsavedOrder(false)
    /*
    setSavingOrder(true)
    try {
      await Promise.all(products.map(async (p, i) => {
        if ((p as any).sort_order !== i) {
          await updateProduct(p.id, { sort_order: i } as any)
        }
      }))
      setHasUnsavedOrder(false)
      msg('Orden guardado correctamente.', 'success')
      await load()
    } catch (e: any) {
      msg('Error al guardar el orden: ' + (e.message ?? 'Inténtelo de nuevo.'), 'error')
    } finally {
      setSavingOrder(false)
    }
    */
  }


  // ── RENDER ─────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen bg-background text-on-background font-body">
      <AdminSidebar />

      {/* Toast */}
      {toast && (
        <div role="alert" aria-live="polite"
          className={`fixed top-5 right-5 z-[100] flex items-center gap-3 px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest shadow-xl ${
            toast.type === 'success' ? 'bg-white text-black' : 'bg-error text-on-error'
          }`}>
          <span className="material-symbols-outlined text-sm" aria-hidden="true">
            {toast.type === 'success' ? 'check_circle' : 'error'}
          </span>
          {toast.message}
        </div>
      )}

      {/* Delete Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4"
          role="dialog" aria-modal="true">
          <div className="bg-surface-container border border-outline-variant/20 p-10 max-w-sm w-full">
            <h3 className="font-headline text-white text-base uppercase tracking-widest mb-3">Confirmar Eliminación</h3>
            <p className="text-neutral-400 text-sm mb-8">Esta acción es permanente e irreversible.</p>
            <div className="flex gap-3">
              <button onClick={handleDelete}
                className="flex-1 bg-error text-on-error py-3 text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-opacity">
                Eliminar
              </button>
              <button onClick={() => setDeleteId(null)}
                className="flex-1 border border-outline-variant/30 text-neutral-400 py-3 text-[10px] font-bold uppercase tracking-widest hover:text-white hover:border-white transition-all">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main */}
      <main className="ml-56 flex-grow flex flex-col min-h-screen">

        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-outline-variant/10 px-8 py-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="font-headline text-base text-white uppercase tracking-[0.2em]">
              {view === 'form' ? (editing ? 'Editar Producto' : 'Nuevo Producto') : 'Panel de Inventario'}
            </h2>
            <p className="text-[9px] text-neutral-500 uppercase tracking-widest mt-0.5">
              {editing ? `Editando: ${editing.name}` : `${products.length} piezas · ${groups.length} categorías`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {view === 'inventory' && (
              <>
                <div className="relative hidden md:block">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-sm" aria-hidden="true">search</span>
                  <input
                    value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Buscar producto..."
                    className="bg-surface-container-low border border-outline-variant/10 text-white text-xs pl-9 pr-4 py-2 outline-none focus:border-white transition-colors w-48 placeholder:text-neutral-600"
                  />
                </div>
                {hasUnsavedOrder && (
                  <button onClick={saveOrder} disabled={savingOrder}
                    className="flex items-center gap-2 bg-emerald-600/20 border border-emerald-500/50 text-emerald-400 px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-600/40 transition-all whitespace-nowrap">
                    <span className="material-symbols-outlined text-sm" aria-hidden="true">save</span>
                    {savingOrder ? 'Guardando...' : 'Guardar Orden'}
                  </button>
                )}
                <button onClick={() => openNew()}
                  className="flex items-center gap-2 bg-white text-black px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-200 transition-all whitespace-nowrap">
                  <span className="material-symbols-outlined text-sm" aria-hidden="true">add</span>
                  Agregar Producto
                </button>
              </>
            )}
            {view === 'form' && (
              <button onClick={cancelForm}
                className="flex items-center gap-2 border border-outline-variant/30 text-neutral-400 px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:text-white hover:border-white transition-all">
                <span className="material-symbols-outlined text-sm" aria-hidden="true">arrow_back</span>
                Volver
              </button>
            )}
          </div>
        </header>

        <div className="p-8 flex-grow">

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
            {[
              { label: 'Total Piezas', value: stats.total,    icon: 'diamond',       color: false },
              { label: 'En Stock',     value: stats.inStock,  icon: 'check_circle',  color: false },
              { label: 'Stock Bajo',   value: stats.lowStock, icon: 'warning',       color: stats.lowStock > 0 },
              { label: 'Sin Stock',    value: stats.noStock,  icon: 'cancel',        color: stats.noStock > 0 },
            ].map(s => (
              <div key={s.label} className="bg-surface-container-low border border-outline-variant/10 p-4 flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <span className="text-[8px] uppercase tracking-[0.35em] text-neutral-500 font-bold leading-tight">{s.label}</span>
                  <span className={`material-symbols-outlined text-sm ${s.color ? 'text-yellow-500' : 'text-neutral-700'}`} aria-hidden="true">{s.icon}</span>
                </div>
                <p className={`font-headline text-3xl leading-none ${s.color ? 'text-yellow-400' : 'text-white'}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* ── INVENTORY ──────────────────────────────────────── */}
          {view === 'inventory' && (
            <div>
              {/* Category filter chips */}
              {groups.length > 1 && (
                <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
                  <button onClick={() => setActiveGroup('all')}
                    className={`flex-shrink-0 px-4 py-1.5 text-[9px] font-bold uppercase tracking-widest transition-all ${
                      activeGroup === 'all' ? 'bg-white text-black' : 'border border-outline-variant/20 text-neutral-400 hover:text-white hover:border-white'
                    }`}>
                    Todos ({products.length})
                  </button>
                  {groups.map(g => (
                    <button key={g.id} onClick={() => setActiveGroup(g.id)}
                      className={`flex-shrink-0 px-4 py-1.5 text-[9px] font-bold uppercase tracking-widest transition-all ${
                        activeGroup === g.id ? 'bg-white text-black' : 'border border-outline-variant/20 text-neutral-400 hover:text-white hover:border-white'
                      }`}>
                      {g.name} ({g.products.length})
                    </button>
                  ))}
                </div>
              )}

              {loading ? (
                <div className="py-20 flex justify-center">
                  <div className="w-6 h-6 border-2 border-neutral-700 border-t-white rounded-full animate-spin" />
                </div>
              ) : displayGroups.length === 0 ? (
                <div className="py-24 flex flex-col items-center gap-4 bg-surface-container-low border border-outline-variant/10">
                  <span className="material-symbols-outlined text-5xl text-neutral-800" aria-hidden="true">inventory_2</span>
                  <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">Sin productos</p>
                  <button onClick={() => openNew()} className="mt-2 text-[10px] text-white underline underline-offset-4 font-bold uppercase tracking-widest">
                    Agregar primer producto
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {displayGroups.map(group => (
                    <div key={group.id} className={`bg-neutral-900 border rounded-xl overflow-hidden mb-4 ${group.borderColor || 'border-neutral-800'}`}>
                      {/* Group header */}
                      <div className="flex items-center justify-between px-6 py-4 hover:bg-neutral-800 transition-colors cursor-pointer" onClick={() => toggleGroup(group.id)}>
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-neutral-400 transition-transform text-lg"
                            style={{ transform: openGroups.has(group.id) ? 'rotate(180deg)' : 'rotate(0deg)' }}
                            aria-hidden="true">
                            expand_more
                          </span>
                          {group.icon && (
                            <span className={`material-symbols-outlined text-xl ${group.color || 'text-white'}`} aria-hidden="true">{group.icon}</span>
                          )}
                          <span className={`text-sm font-bold uppercase tracking-[0.1em] ${group.color || 'text-white'}`}>{group.name}</span>
                          <span className="text-[10px] text-neutral-400 font-bold bg-neutral-800 border border-neutral-700 rounded-full px-3 py-1">
                            {group.products.length} items
                          </span>
                        </div>
                      </div>

                      {/* Group grid */}
                      {openGroups.has(group.id) && (
                        <div className="p-5 border-t border-neutral-800 bg-black/40">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {group.products.map((p) => {
                              const isDragging = draggedId === p.id
                              return (
                                <div 
                                  key={p.id}
                                  draggable
                                  onDragStart={(e) => handleDragStart(e, p.id)}
                                  onDragOver={handleDragOver}
                                  onDrop={(e) => handleDrop(e, p.id)}
                                  className={`relative flex p-3 rounded-xl border transition-all ${isDragging ? 'opacity-50 border-white bg-neutral-800' : 'border-neutral-800 bg-neutral-900/60 hover:bg-neutral-800/80 hover:border-neutral-700'}`}
                                >
                                  {/* Left: Handle + Image */}
                                  <div className="flex flex-col gap-2 items-center mr-4">
                                    <span className="material-symbols-outlined text-neutral-600 cursor-grab active:cursor-grabbing text-sm hover:text-white" title="Mover">drag_indicator</span>
                                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-black flex items-center justify-center border border-neutral-800">
                                      {p.images?.[0] ? (
                                        <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                                      ) : (
                                        <span className="material-symbols-outlined text-neutral-700 text-lg">diamond</span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Right: Details */}
                                  <div className="flex flex-col flex-1 overflow-hidden">
                                    <div className="flex justify-between items-start gap-2">
                                      <h4 className="text-white font-bold text-xs leading-tight truncate flex-1">{p.name}</h4>
                                      <span className="text-[9px] bg-neutral-800 border border-neutral-700 px-2 py-0.5 rounded text-white font-bold tracking-wider whitespace-nowrap">
                                        {formatPrice(p.price)}
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-2 mt-2">
                                      <span className="text-[8px] font-bold text-blue-500 tracking-wider">ADMIN</span>
                                      <span className="text-[8px] font-bold text-emerald-500 tracking-wider">ACTIVE</span>
                                    </div>

                                    <p className="text-[9px] text-neutral-500 mt-2 font-mono truncate">ID: {p.id.split('-')[0].toUpperCase()}</p>

                                    <div className="mt-auto pt-3 flex items-center justify-between">
                                      <span className="bg-neutral-800 border border-neutral-700 px-2 py-1 text-[9px] font-bold text-white rounded">
                                        Total {p.stock ?? 0}
                                      </span>

                                      {/* Actions */}
                                      <div className="flex gap-2">
                                        <button onClick={() => openEdit(p)} title="Editar"
                                          className="w-7 h-7 rounded-full bg-blue-600/90 hover:bg-blue-500 text-white flex items-center justify-center shadow-lg transition-colors">
                                          <span className="material-symbols-outlined text-[13px]">edit</span>
                                        </button>
                                        <button onClick={() => setDeleteId(p.id)} title="Eliminar"
                                          className="w-7 h-7 rounded-full bg-red-900/30 hover:bg-red-800/80 text-red-500 hover:text-white border border-red-900/50 flex items-center justify-center transition-colors">
                                          <span className="material-symbols-outlined text-[13px]">delete</span>
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── ADD / EDIT FORM ────────────────────────────────── */}
          {view === 'form' && (
            <form onSubmit={handleSubmit} noValidate className="grid grid-cols-12 gap-6">

              {/* LEFT: Product info */}
              <div className="col-span-12 lg:col-span-7 space-y-4">

                {/* Card 1: Básico */}
                <div className="bg-surface-container-low border border-outline-variant/10 p-6">
                  <h3 className="text-[9px] uppercase tracking-[0.35em] text-neutral-400 font-bold mb-5 flex items-center gap-2">
                    <span className="w-5 h-5 bg-white text-black text-[8px] font-black flex items-center justify-center">1</span>
                    Información Básica
                  </h3>
                  <div className="space-y-5">
                    <div>
                      <label htmlFor="f-name" className="block text-[9px] tracking-[0.2em] text-neutral-500 uppercase mb-2 font-bold">
                        Nombre <span className="text-error">*</span>
                      </label>
                      <input id="f-name" name="name" value={formData.name} onChange={handleInput} required autoComplete="off"
                        placeholder="Ej: Anillo Celestial Orbit"
                        className="w-full bg-transparent border-b border-neutral-800 text-white text-sm py-2.5 outline-none focus:border-white transition-colors placeholder:text-neutral-700" />
                    </div>
                    <div>
                      <label htmlFor="f-slug" className="block text-[9px] tracking-[0.2em] text-neutral-500 uppercase mb-2 font-bold">
                        Slug (URL)
                      </label>
                      <input id="f-slug" name="slug" value={formData.slug} onChange={handleInput} autoComplete="off"
                        placeholder="anillo-celestial-orbit"
                        className="w-full bg-transparent border-b border-neutral-800 text-neutral-400 text-xs py-2.5 outline-none focus:border-white transition-colors placeholder:text-neutral-700" />
                    </div>
                    <div>
                      <label htmlFor="f-desc" className="block text-[9px] tracking-[0.2em] text-neutral-500 uppercase mb-2 font-bold">
                        Descripción
                      </label>
                      <textarea id="f-desc" name="description" value={formData.description} onChange={handleInput}
                        rows={3} placeholder="Describe la pieza..."
                        className="w-full bg-transparent border border-neutral-800 text-white text-sm font-light p-3 outline-none focus:border-white transition-colors resize-none placeholder:text-neutral-700" />
                    </div>
                  </div>
                </div>

                {/* Card 2: Clasificación */}
                <div className="bg-surface-container-low border border-outline-variant/10 p-6">
                  <h3 className="text-[9px] uppercase tracking-[0.35em] text-neutral-400 font-bold mb-5 flex items-center gap-2">
                    <span className="w-5 h-5 bg-white text-black text-[8px] font-black flex items-center justify-center">2</span>
                    Clasificación
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                      <label className="block text-[9px] tracking-[0.2em] text-neutral-500 uppercase mb-2 font-bold">
                        Categoría <span className="text-error">*</span>
                      </label>
                      <CategoryPicker
                        value={formData.category_id}
                        onChange={id => setFormData(prev => ({ ...prev, category_id: id }))}
                        categories={categories}
                      />
                    </div>
                    <div>
                      <label htmlFor="f-mat" className="block text-[9px] tracking-[0.2em] text-neutral-500 uppercase mb-2 font-bold">Material</label>
                      <input id="f-mat" name="material" value={formData.material} onChange={handleInput} autoComplete="off"
                        placeholder="Oro 18k, Diamante..."
                        className="w-full bg-transparent border-b border-neutral-800 text-white text-sm py-2.5 outline-none focus:border-white transition-colors placeholder:text-neutral-700" />
                    </div>
                    <div className="md:col-span-1 flex items-center gap-3 mt-2">
                      <input
                        type="checkbox"
                        id="f-featured"
                        name="featured"
                        checked={formData.featured}
                        onChange={handleInput}
                        className="w-4 h-4 accent-white bg-neutral-900 border-neutral-800"
                      />
                      <label htmlFor="f-featured" className="text-[10px] uppercase tracking-widest text-white font-bold cursor-pointer">
                        Destacar Inicio
                      </label>
                    </div>
                    <div className="md:col-span-1 flex items-center gap-3 mt-2">
                      <input
                        type="checkbox"
                        id="f-trending"
                        name="is_trending"
                        checked={formData.is_trending}
                        onChange={handleInput}
                        className="w-4 h-4 accent-white bg-neutral-900 border-neutral-800"
                      />
                      <label htmlFor="f-trending" className="text-[10px] uppercase tracking-widest text-white font-bold cursor-pointer">
                        Tendencia 🔥
                      </label>
                    </div>
                  </div>
                </div>

                {/* Card: Variantes */}
                <div className="bg-surface-container-low border border-outline-variant/10 p-6">
                  <h3 className="text-[9px] uppercase tracking-[0.35em] text-neutral-400 font-bold mb-5 flex items-center gap-2">
                    <span className="w-5 h-5 bg-white text-black text-[8px] font-black flex items-center justify-center">V</span>
                    Variaciones (Tallas)
                  </h3>
                  <div className="space-y-5">
                    <div className="flex gap-2">
                      <input 
                        id="new-size-input"
                        placeholder="Ej: 18cm, ajustable..."
                        className="flex-grow bg-transparent border-b border-neutral-800 text-white text-xs py-2 outline-none focus:border-white transition-colors placeholder:text-neutral-700"
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); const v = (e.target as any).value; if (v) { setVariants([...variants, { id: Math.random().toString(), productId: editing?.id || '', size: v, stock: 10 }]); (e.target as any).value = '' } } }}
                      />
                      <button 
                        type="button"
                        onClick={() => { const inp = document.getElementById('new-size-input') as HTMLInputElement; if (inp.value) { setVariants([...variants, { id: Math.random().toString(), productId: editing?.id || '', size: inp.value, stock: 10 }]); inp.value = '' } }}
                        className="bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors"
                      >
                        Añadir
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {variants.map((v, i) => (
                        <div key={i} className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-md group">
                          <span className="text-[11px] text-white font-bold">{v.size}</span>
                          <button 
                            type="button"
                            onClick={() => setVariants(variants.filter((_, j) => j !== i))}
                            className="text-neutral-600 hover:text-red-500 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[14px]">close</span>
                          </button>
                        </div>
                      ))}
                      {variants.length === 0 && <p className="text-[9px] text-neutral-600 uppercase font-bold">Sin variaciones registradas.</p>}
                    </div>
                  </div>
                </div>

                {/* Card 3: Precio & Stock */}
                <div className="bg-surface-container-low border border-outline-variant/10 p-6">
                  <h3 className="text-[9px] uppercase tracking-[0.35em] text-neutral-400 font-bold mb-5 flex items-center gap-2">
                    <span className="w-5 h-5 bg-white text-black text-[8px] font-black flex items-center justify-center">3</span>
                    Precio e Inventario
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                      <label htmlFor="f-price" className="block text-[9px] tracking-[0.2em] text-neutral-500 uppercase mb-2 font-bold">
                        Precio (Gs.) <span className="text-error">*</span>
                      </label>
                      <input id="f-price" name="price" type="number" min="0" value={formData.price} onChange={handleInput} required
                        placeholder="0"
                        className="w-full bg-transparent border-b border-neutral-800 text-white text-sm py-2.5 outline-none focus:border-white transition-colors placeholder:text-neutral-700" />
                    </div>
                    <div>
                      <label htmlFor="f-oprice" className="block text-[9px] tracking-[0.2em] text-neutral-500 uppercase mb-2 font-bold">
                        Precio Original (tachado)
                      </label>
                      <input id="f-oprice" name="original_price" type="number" min="0" value={formData.original_price} onChange={handleInput}
                        placeholder="0"
                        className="w-full bg-transparent border-b border-neutral-800 text-neutral-400 text-sm py-2.5 outline-none focus:border-white transition-colors placeholder:text-neutral-700" />
                    </div>
                    <div>
                      <label htmlFor="f-stock" className="block text-[9px] tracking-[0.2em] text-neutral-500 uppercase mb-2 font-bold">
                        Stock <span className="text-error">*</span>
                      </label>
                      <input id="f-stock" name="stock" type="number" min="0" value={formData.stock} onChange={handleInput} required
                        placeholder="0"
                        className="w-full bg-transparent border-b border-neutral-800 text-white text-sm py-2.5 outline-none focus:border-white transition-colors placeholder:text-neutral-700" />
                    </div>
                    <div>
                      <label htmlFor="f-rating" className="block text-[9px] tracking-[0.2em] text-neutral-500 uppercase mb-2 font-bold">
                        Rating (1-5)
                      </label>
                      <input id="f-rating" name="rating" type="number" step="0.1" min="0" max="5" value={formData.rating} onChange={handleInput}
                        className="w-full bg-transparent border-b border-neutral-800 text-white text-sm py-2.5 outline-none focus:border-white transition-colors" />
                    </div>
                    <div>
                      <label htmlFor="f-rev" className="block text-[9px] tracking-[0.2em] text-neutral-500 uppercase mb-2 font-bold">
                        Reseñas
                      </label>
                      <input id="f-rev" name="reviews_count" type="number" min="0" value={formData.reviews_count} onChange={handleInput}
                        className="w-full bg-transparent border-b border-neutral-800 text-white text-sm py-2.5 outline-none focus:border-white transition-colors" />
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT: Images */}
              <div className="col-span-12 lg:col-span-5">
                <div className="bg-surface-container-low border border-outline-variant/10 p-6 sticky top-24">
                  <h3 className="text-[9px] uppercase tracking-[0.35em] text-neutral-400 font-bold mb-5 flex items-center gap-2">
                    <span className="w-5 h-5 bg-white text-black text-[8px] font-black flex items-center justify-center">4</span>
                    Imágenes
                  </h3>

                  {/* Cloudinary upload */}
                  <CldUploadWidget
                    uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                    onSuccess={(r: any) => { if (r.info?.secure_url) setImages(p => [...p, r.info.secure_url]) }}
                  >
                    {({ open }) => (
                      <button type="button" onClick={() => open()}
                        className="w-full border-2 border-dashed border-neutral-700 hover:border-white py-8 flex flex-col items-center gap-2.5 group transition-all mb-4">
                        <span className="material-symbols-outlined text-3xl text-neutral-600 group-hover:text-white transition-colors" aria-hidden="true">cloud_upload</span>
                        <p className="text-[9px] uppercase tracking-widest text-neutral-500 group-hover:text-white transition-colors font-bold">Subir desde PC</p>
                        <p className="text-[8px] text-neutral-700 group-hover:text-neutral-400 transition-colors">JPG, PNG, WEBP</p>
                      </button>
                    )}
                  </CldUploadWidget>

                  {/* URL input */}
                  <div className="mb-5">
                    <label className="block text-[9px] tracking-[0.2em] text-neutral-500 uppercase mb-2 font-bold">Agregar por URL</label>
                    <div className="flex gap-2">
                      <input type="url" value={urlInput} onChange={e => setUrlInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addUrl() } }}
                        placeholder="https://..."
                        className="flex-grow bg-transparent border-b border-neutral-800 text-white text-xs py-2.5 outline-none focus:border-white transition-colors placeholder:text-neutral-700" />
                      <button type="button" onClick={addUrl} aria-label="Agregar URL"
                        className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-sm font-bold transition-colors">+</button>
                    </div>
                  </div>

                  {/* Previews */}
                  {images.length > 0 && (
                    <div className="mb-5">
                      <p className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold mb-3">
                        {images.length} imagen{images.length !== 1 ? 'es' : ''}
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {images.map((url, i) => (
                          <div key={i} className="aspect-square bg-neutral-900 border border-neutral-800 relative group overflow-hidden">
                            <img src={url} alt="" className="w-full h-full object-cover" />
                            {i === 0 && (
                              <span className="absolute top-1 left-1 bg-white text-black text-[7px] font-black px-1 py-0.5 uppercase">Principal</span>
                            )}
                            <button type="button"
                              onClick={() => setImages(p => p.filter((_, j) => j !== i))}
                              aria-label="Eliminar imagen"
                              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="material-symbols-outlined text-white text-sm" aria-hidden="true">close</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Submit */}
                  <div className="pt-5 border-t border-outline-variant/10 flex gap-3">
                    {editing && (
                      <button type="button" onClick={cancelForm}
                        className="flex-1 border border-outline-variant/30 text-neutral-400 py-3.5 text-[10px] font-bold uppercase tracking-widest hover:text-white hover:border-white transition-all">
                        Cancelar
                      </button>
                    )}
                    <button type="submit" disabled={submitting}
                      className="flex-1 bg-white text-black py-3.5 text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                      {submitting && <span className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />}
                      {submitting ? 'Guardando...' : editing ? 'Actualizar Pieza' : 'Registrar Pieza'}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  )
}
