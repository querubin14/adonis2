'use client'

import { useState, useEffect, useCallback } from 'react'
import AdminSidebar from '@/components/AdminSidebar'
import { getAllHeroes, insertHero, saveHero, deleteHero } from '@/lib/data'
import { HeroSettings } from '@/lib/types'
import { CldUploadWidget } from 'next-cloudinary'

interface Toast { message: string; type: 'success' | 'error' }

const EMPTY: Omit<HeroSettings, 'id' | 'updated_at'> = {
  title: '',
  subtitle: '',
  image_url: '',
  cta_text: '',
  cta_url: '',
  is_active: true,
  sort_order: 0,
}

export default function HeroAdminPage() {
  const [heroes, setHeroes]       = useState<HeroSettings[]>([])
  const [loading, setLoading]     = useState(true)
  const [editing, setEditing]     = useState<HeroSettings | null>(null)
  const [form, setForm]           = useState(EMPTY)
  const [showForm, setShowForm]   = useState(false)
  const [saving, setSaving]       = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<HeroSettings | null>(null)
  const [toast, setToast]         = useState<Toast | null>(null)
  const [urlInput, setUrlInput]   = useState('')

  const load = useCallback(async () => {
    try {
      const data = await getAllHeroes()
      setHeroes(data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(t)
  }, [toast])

  function msg(message: string, type: Toast['type']) { setToast({ message, type }) }

  function openNew() {
    setEditing(null)
    setForm({ ...EMPTY, sort_order: heroes.length })
    setUrlInput('')
    setShowForm(true)
  }

  function openEdit(h: HeroSettings) {
    setEditing(h)
    setForm({
      title: h.title ?? '',
      subtitle: h.subtitle ?? '',
      image_url: h.image_url ?? '',
      cta_text: h.cta_text ?? '',
      cta_url: h.cta_url ?? '',
      is_active: h.is_active ?? true,
      sort_order: h.sort_order ?? 0,
    })
    setUrlInput('')
    setShowForm(true)
    setTimeout(() => document.getElementById('hero-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  function closeForm() {
    setEditing(null)
    setShowForm(false)
  }

  function handleInput(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value }))
  }

  function applyUrl() {
    const t = urlInput.trim()
    if (t) { setForm(prev => ({ ...prev, image_url: t })); setUrlInput('') }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        title: form.title.trim(),
        subtitle: form.subtitle?.trim() || null,
        image_url: form.image_url?.trim() || null,
        cta_text: form.cta_text?.trim() || null,
        cta_url: form.cta_url?.trim() || null,
        is_active: form.is_active,
        sort_order: Number(form.sort_order) || 0,
      }
      if (editing) {
        await saveHero(editing.id, payload)
        msg('Hero actualizado.', 'success')
      } else {
        await insertHero(payload)
        msg('Hero creado.', 'success')
      }
      closeForm()
      await load()
    } catch (err: any) {
      msg('Error: ' + (err.message ?? 'Inténtelo nuevamente.'), 'error')
    } finally { setSaving(false) }
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return
    try {
      await deleteHero(deleteTarget.id)
      msg('Hero eliminado.', 'success')
      setDeleteTarget(null)
      await load()
    } catch (err: any) {
      msg('Error: ' + (err.message ?? ''), 'error')
    }
  }

  return (
    <div className="flex min-h-screen bg-background text-on-background font-body">

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

      {/* Delete confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="bg-surface-container border border-outline-variant/20 p-10 max-w-sm w-full">
            <h3 className="font-headline text-white text-base uppercase tracking-widest mb-2">Eliminar Hero</h3>
            <p className="text-neutral-300 text-sm font-medium mb-6">"{deleteTarget.title}"</p>
            <div className="flex gap-3">
              <button onClick={handleDeleteConfirm}
                className="flex-1 bg-error text-on-error py-3 text-[10px] font-bold uppercase tracking-widest hover:opacity-90">
                Eliminar
              </button>
              <button onClick={() => setDeleteTarget(null)}
                className="flex-1 border border-outline-variant/30 text-neutral-400 py-3 text-[10px] font-bold uppercase tracking-widest hover:text-white hover:border-white transition-all">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <AdminSidebar />

      <main className="ml-56 flex-grow flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-outline-variant/10 px-10 py-5 flex items-center justify-between">
          <div>
            <h2 className="font-headline text-base text-white uppercase tracking-[0.2em]">Hero Slider</h2>
            <p className="text-[9px] text-neutral-500 uppercase tracking-widest mt-0.5">
              {heroes.length} slide{heroes.length !== 1 ? 's' : ''} · Se rotan cada 5 segundos
            </p>
          </div>
          <button onClick={openNew}
            className="flex items-center gap-2 bg-white text-black px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-200 transition-all">
            <span className="material-symbols-outlined text-sm" aria-hidden="true">add</span>
            Nuevo Hero
          </button>
        </header>

        <div className="p-10 flex-grow space-y-8">

          {/* Info banner */}
          <div className="flex items-start gap-3 bg-surface-container-low border border-outline-variant/10 p-4">
            <span className="material-symbols-outlined text-sm text-neutral-500 flex-shrink-0 mt-0.5" aria-hidden="true">info</span>
            <p className="text-[9px] text-neutral-400 leading-relaxed">
              Los heroes activos se muestran en la página principal como un slider que avanza automáticamente cada 5 segundos.
              Ordénalos con el campo "Orden" — el número más bajo aparece primero.
            </p>
          </div>

          {/* SQL migration hint if no heroes */}
          {!loading && heroes.length === 0 && (
            <div className="bg-surface-container-low border border-outline-variant/10 p-6 space-y-4">
              <p className="text-[9px] text-neutral-400 uppercase tracking-widest font-bold">Configuración inicial requerida</p>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Ejecuta este SQL en Supabase para añadir las columnas necesarias:
              </p>
              <pre className="bg-background border border-outline-variant/10 p-4 text-xs text-neutral-300 font-mono overflow-x-auto">{`ALTER TABLE hero_settings
  ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0;`}</pre>
              <button onClick={load}
                className="flex items-center gap-2 border border-outline-variant/30 text-neutral-400 px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:text-white hover:border-white transition-all">
                <span className="material-symbols-outlined text-sm" aria-hidden="true">refresh</span>
                Reintentar
              </button>
            </div>
          )}

          {/* Edit / Create Form */}
          {showForm && (
            <div id="hero-form" className="bg-surface-container-low border border-outline-variant/10 p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[9px] uppercase tracking-[0.35em] text-neutral-400 font-bold">
                  {editing ? `Editando: ${editing.title}` : 'Nuevo Hero'}
                </h3>
                <button onClick={closeForm} aria-label="Cerrar formulario"
                  className="p-1.5 text-neutral-500 hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-base" aria-hidden="true">close</span>
                </button>
              </div>

              <form onSubmit={handleSubmit} noValidate>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

                  {/* LEFT: Fields */}
                  <div className="space-y-5">
                    {/* Title */}
                    <div>
                      <label htmlFor="h-title" className="block text-[9px] tracking-[0.25em] text-neutral-500 uppercase mb-2 font-bold">
                        Título <span className="text-error">*</span>
                      </label>
                      <input id="h-title" name="title" value={form.title} onChange={handleInput} required
                        placeholder="Precisión Etérea"
                        className="w-full bg-transparent border-b border-neutral-800 text-white text-sm py-2.5 outline-none focus:border-white transition-colors placeholder:text-neutral-700" />
                    </div>
                    {/* Subtitle */}
                    <div>
                      <label htmlFor="h-sub" className="block text-[9px] tracking-[0.25em] text-neutral-500 uppercase mb-2 font-bold">Subtítulo / etiqueta</label>
                      <input id="h-sub" name="subtitle" value={form.subtitle ?? ''} onChange={handleInput}
                        placeholder="Exposición Otoño 2024"
                        className="w-full bg-transparent border-b border-neutral-800 text-white text-sm py-2.5 outline-none focus:border-white transition-colors placeholder:text-neutral-700" />
                    </div>

                    {/* CTA */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="h-ctat" className="block text-[9px] tracking-[0.25em] text-neutral-500 uppercase mb-2 font-bold">Texto del botón</label>
                        <input id="h-ctat" name="cta_text" value={form.cta_text ?? ''} onChange={handleInput}
                          placeholder="Explorar Colección"
                          className="w-full bg-transparent border-b border-neutral-800 text-white text-sm py-2.5 outline-none focus:border-white transition-colors placeholder:text-neutral-700" />
                      </div>
                      <div>
                        <label htmlFor="h-ctau" className="block text-[9px] tracking-[0.25em] text-neutral-500 uppercase mb-2 font-bold">URL del botón</label>
                        <input id="h-ctau" name="cta_url" value={form.cta_url ?? ''} onChange={handleInput}
                          placeholder="/products"
                          className="w-full bg-transparent border-b border-neutral-800 text-white text-sm py-2.5 outline-none focus:border-white transition-colors placeholder:text-neutral-700" />
                      </div>
                    </div>

                    {/* Order + Active */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="h-order" className="block text-[9px] tracking-[0.25em] text-neutral-500 uppercase mb-2 font-bold">Orden</label>
                        <input id="h-order" name="sort_order" type="number" min="0" value={form.sort_order ?? 0} onChange={handleInput}
                          className="w-full bg-transparent border-b border-neutral-800 text-white text-sm py-2.5 outline-none focus:border-white transition-colors" />
                        <p className="text-[8px] text-neutral-600 mt-1">Menor = primero</p>
                      </div>
                      <div className="flex items-end pb-2.5">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <div className={`w-10 h-5 flex-shrink-0 transition-colors ${form.is_active ? 'bg-white' : 'bg-neutral-700'} relative`}
                            onClick={() => setForm(p => ({ ...p, is_active: !p.is_active }))}
                            role="switch" aria-checked={form.is_active}>
                            <span className={`absolute top-0.5 w-4 h-4 bg-black transition-transform ${form.is_active ? 'translate-x-5' : 'translate-x-0.5'}`} />
                          </div>
                          <span className="text-[9px] uppercase tracking-[0.25em] text-neutral-400 font-bold">
                            {form.is_active ? 'Activo' : 'Inactivo'}
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* Image section */}
                    <div>
                      <p className="text-[9px] tracking-[0.25em] text-neutral-500 uppercase mb-3 font-bold">Imagen de Fondo</p>

                      <CldUploadWidget
                        uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                        onSuccess={(r: any) => {
                          if (r.info?.secure_url) setForm(prev => ({ ...prev, image_url: r.info.secure_url }))
                        }}
                      >
                        {({ open }) => (
                          <button type="button" onClick={() => open()}
                            className="w-full border-2 border-dashed border-neutral-700 hover:border-white py-5 flex flex-col items-center gap-2 group transition-all mb-3">
                            <span className="material-symbols-outlined text-2xl text-neutral-600 group-hover:text-white transition-colors" aria-hidden="true">cloud_upload</span>
                            <p className="text-[9px] uppercase tracking-widest text-neutral-500 group-hover:text-white transition-colors font-bold">Subir desde PC</p>
                          </button>
                        )}
                      </CldUploadWidget>

                      <div className="flex gap-2">
                        <input type="url" value={urlInput} onChange={e => setUrlInput(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); applyUrl() } }}
                          placeholder="O pega una URL de imagen..."
                          className="flex-1 bg-transparent border-b border-neutral-800 text-white text-xs py-2 outline-none focus:border-white transition-colors placeholder:text-neutral-700" />
                        <button type="button" onClick={applyUrl}
                          className="px-3 py-1.5 bg-white text-black text-[9px] font-bold uppercase tracking-widest hover:bg-neutral-200 transition-all flex-shrink-0">
                          Aplicar
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button type="submit" disabled={saving}
                        className="flex-1 bg-white text-black py-3.5 text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                        {saving && <span className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />}
                        {saving ? 'Guardando...' : editing ? 'Actualizar' : 'Crear Hero'}
                      </button>
                      <button type="button" onClick={closeForm}
                        className="px-6 py-3.5 border border-outline-variant/30 text-neutral-400 text-[10px] font-bold uppercase tracking-widest hover:text-white hover:border-white transition-all">
                        Cancelar
                      </button>
                    </div>
                  </div>

                  {/* RIGHT: Live preview */}
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.35em] text-neutral-500 font-bold mb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm" aria-hidden="true">preview</span>
                      Vista previa
                    </p>
                    <div className="relative overflow-hidden aspect-video bg-neutral-950 border border-outline-variant/10">
                      {form.image_url ? (
                        <img src={form.image_url} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="material-symbols-outlined text-6xl text-neutral-800" aria-hidden="true">image</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <span className="font-label uppercase tracking-[0.45em] text-[7px] text-yellow-400 mb-1 block font-bold">
                          {form.subtitle || 'Subtítulo'}
                        </span>
                        <h2 className="font-headline text-lg text-white uppercase leading-tight tracking-tight mb-2">
                          {form.title || 'Título del Hero'}
                        </h2>
                        {form.cta_text && (
                          <span className="px-4 py-1.5 bg-white text-black text-[7px] font-bold uppercase tracking-wider inline-block">
                            {form.cta_text}
                          </span>
                        )}
                      </div>
                      {!form.is_active && (
                        <div className="absolute top-3 right-3 bg-neutral-800/80 px-2 py-0.5">
                          <span className="text-[7px] uppercase tracking-widest text-neutral-400 font-bold">Inactivo</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* Hero list */}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-6 h-6 border-2 border-neutral-700 border-t-white rounded-full animate-spin" />
            </div>
          ) : heroes.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {heroes.map((h, idx) => (
                <div key={h.id} className={`bg-surface-container-low border overflow-hidden ${h.is_active ? 'border-outline-variant/10' : 'border-neutral-800 opacity-60'}`}>
                  {/* Thumbnail */}
                  <div className="relative aspect-video overflow-hidden bg-neutral-950">
                    {h.image_url
                      ? <img src={h.image_url} alt={h.title} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-4xl text-neutral-800" aria-hidden="true">image</span>
                        </div>
                    }
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    {/* Slide number */}
                    <div className="absolute top-2 left-2 bg-white/10 backdrop-blur-sm px-2 py-0.5">
                      <span className="text-[8px] uppercase tracking-widest text-white font-bold"># {idx + 1}</span>
                    </div>
                    {/* Active badge */}
                    <div className={`absolute top-2 right-2 px-2 py-0.5 ${h.is_active ? 'bg-emerald-900/70' : 'bg-neutral-800/70'}`}>
                      <span className={`text-[7px] uppercase tracking-widest font-bold ${h.is_active ? 'text-emerald-400' : 'text-neutral-500'}`}>
                        {h.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className="font-headline text-sm text-white uppercase tracking-wide leading-tight line-clamp-1">{h.title}</p>
                      {h.subtitle && <p className="text-[8px] text-neutral-300 mt-0.5 truncate">{h.subtitle}</p>}
                    </div>
                  </div>
                  {/* Actions */}
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-1.5 text-[8px] text-neutral-500 font-bold uppercase tracking-wider">
                      <span className="material-symbols-outlined text-xs" aria-hidden="true">swap_vert</span>
                      Orden: {h.sort_order ?? 0}
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(h)} aria-label={`Editar ${h.title}`}
                        className="p-2 text-neutral-500 hover:text-white hover:bg-neutral-800 transition-all">
                        <span className="material-symbols-outlined text-sm" aria-hidden="true">edit</span>
                      </button>
                      <button onClick={() => setDeleteTarget(h)} aria-label={`Eliminar ${h.title}`}
                        className="p-2 text-neutral-500 hover:text-error hover:bg-error/10 transition-all">
                        <span className="material-symbols-outlined text-sm" aria-hidden="true">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </main>
    </div>
  )
}
