'use client'

import { useState, useEffect } from 'react'
import AdminSidebar from '@/components/AdminSidebar'
import { CldUploadWidget } from 'next-cloudinary'
import { getAllReviews, insertReview, updateReview, deleteReview } from '@/lib/data'
import { Review } from '@/lib/types'

const EMPTY: Omit<Review, 'id' | 'created_at'> = {
  name: '',
  location: '',
  rating: 5,
  text: '',
  photo_url: '',
  is_active: true,
  sort_order: 0,
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Review | null>(null)
  const [photoMode, setPhotoMode] = useState<'url' | 'upload'>('url')
  const [error, setError] = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try { setReviews(await getAllReviews()) } catch {}
    setLoading(false)
  }

  function handleInput(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleEdit(r: Review) {
    setEditId(r.id)
    setForm({
      name: r.name,
      location: r.location ?? '',
      rating: r.rating,
      text: r.text,
      photo_url: r.photo_url ?? '',
      is_active: r.is_active ?? true,
      sort_order: r.sort_order ?? 0,
    })
    setPhotoMode(r.photo_url ? 'url' : 'url')
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelEdit() {
    setEditId(null)
    setForm(EMPTY)
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.text.trim()) { setError('Nombre y texto son obligatorios.'); return }
    setSaving(true)
    setError('')
    try {
      const payload = {
        ...form,
        sort_order: Number(form.sort_order) || 0,
        rating: Number(form.rating) || 5,
        photo_url: form.photo_url?.trim() || null,
        location: form.location?.trim() || null,
      }
      if (editId) {
        await updateReview(editId, payload)
      } else {
        await insertReview(payload)
      }
      await load()
      cancelEdit()
    } catch (err: any) {
      setError(err.message ?? 'Error al guardar')
    }
    setSaving(false)
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    try { await deleteReview(deleteTarget.id); await load() } catch {}
    setDeleteTarget(null)
  }

  async function toggleActive(r: Review) {
    try {
      await updateReview(r.id, { is_active: !r.is_active })
      setReviews(prev => prev.map(x => x.id === r.id ? { ...x, is_active: !x.is_active } : x))
    } catch {}
  }

  return (
    <div className="flex min-h-screen bg-background text-on-background">
      <AdminSidebar />

      <main className="ml-56 flex-1 p-8 max-w-5xl">
        <header className="mb-10">
          <p className="text-[9px] uppercase tracking-[0.45em] text-neutral-500 font-bold mb-2">Panel Admin</p>
          <h1 className="font-headline text-3xl text-white uppercase tracking-tight">Reseñas</h1>
        </header>

        {/* SQL hint banner */}
        {reviews.length === 0 && !loading && (
          <div className="mb-8 border border-neutral-700 bg-neutral-900 p-5 text-xs text-neutral-400 leading-relaxed font-mono">
            <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold mb-3">Tabla no encontrada — ejecuta este SQL en Supabase:</p>
            <pre className="whitespace-pre-wrap text-neutral-300 text-[11px]">{`CREATE TABLE reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  location text,
  rating integer DEFAULT 5,
  text text NOT NULL,
  photo_url text,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);`}</pre>
          </div>
        )}

        {/* ── Form ── */}
        <section className="mb-12 border border-neutral-800 p-6 bg-surface-container-low">
          <h2 className="font-headline text-sm uppercase tracking-widest text-white mb-6">
            {editId ? 'Editar Reseña' : 'Nueva Reseña'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Name */}
              <div>
                <label className="block text-[9px] tracking-[0.2em] text-neutral-500 uppercase mb-2 font-bold">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  name="name" value={form.name} onChange={handleInput} required
                  placeholder="Ej: Valentina M."
                  className="w-full bg-transparent border-b border-neutral-700 text-white text-sm py-2 outline-none focus:border-white transition-colors placeholder:text-neutral-700"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-[9px] tracking-[0.2em] text-neutral-500 uppercase mb-2 font-bold">Ciudad</label>
                <input
                  name="location" value={form.location ?? ''} onChange={handleInput}
                  placeholder="Ej: Asunción"
                  className="w-full bg-transparent border-b border-neutral-700 text-white text-sm py-2 outline-none focus:border-white transition-colors placeholder:text-neutral-700"
                />
              </div>
            </div>

            {/* Rating */}
            <div>
              <label className="block text-[9px] tracking-[0.2em] text-neutral-500 uppercase mb-3 font-bold">Calificación</label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n} type="button"
                    onClick={() => setForm(p => ({ ...p, rating: n }))}
                    className="p-0.5"
                    aria-label={`${n} estrella${n > 1 ? 's' : ''}`}
                  >
                    <span
                      className={`material-symbols-outlined text-2xl transition-colors ${n <= form.rating ? 'text-yellow-400' : 'text-neutral-700'}`}
                      style={{ fontVariationSettings: n <= form.rating ? "'FILL' 1" : "'FILL' 0" }}
                    >
                      star
                    </span>
                  </button>
                ))}
                <span className="ml-2 text-xs text-neutral-500">{form.rating}/5</span>
              </div>
            </div>

            {/* Text */}
            <div>
              <label className="block text-[9px] tracking-[0.2em] text-neutral-500 uppercase mb-2 font-bold">
                Texto / Opinión <span className="text-red-500">*</span>
              </label>
              <textarea
                name="text" value={form.text} onChange={handleInput} required rows={3}
                placeholder="Escribe la reseña del cliente..."
                className="w-full bg-transparent border border-neutral-700 text-white text-sm p-3 outline-none focus:border-white transition-colors placeholder:text-neutral-700 resize-none"
              />
            </div>

            {/* Photo */}
            <div>
              <label className="block text-[9px] tracking-[0.2em] text-neutral-500 uppercase mb-3 font-bold">Imagen / GIF (opcional)</label>

              {/* Toggle URL / Upload */}
              <div className="flex gap-1 mb-3">
                {(['url', 'upload'] as const).map(m => (
                  <button key={m} type="button" onClick={() => setPhotoMode(m)}
                    className={`px-3 py-1 text-[9px] font-bold uppercase tracking-widest transition-all ${photoMode === m ? 'bg-white text-black' : 'border border-neutral-700 text-neutral-500 hover:text-white hover:border-white'}`}>
                    {m === 'url' ? 'URL' : 'Subir archivo'}
                  </button>
                ))}
              </div>

              {photoMode === 'url' ? (
                <input
                  name="photo_url" value={form.photo_url ?? ''} onChange={handleInput}
                  placeholder="https://..."
                  className="w-full bg-transparent border-b border-neutral-700 text-white text-sm py-2 outline-none focus:border-white transition-colors placeholder:text-neutral-700"
                />
              ) : (
                <CldUploadWidget
                  uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? 'adonis_uploads'}
                  onSuccess={(result: any) => {
                    const url = result?.info?.secure_url
                    if (url) setForm(p => ({ ...p, photo_url: url }))
                  }}
                >
                  {({ open }) => (
                    <button type="button" onClick={() => open()}
                      className="w-full border border-dashed border-neutral-700 hover:border-white text-neutral-500 hover:text-white py-4 text-[9px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-sm" aria-hidden="true">upload</span>
                      Subir desde dispositivo
                    </button>
                  )}
                </CldUploadWidget>
              )}

              {/* Preview */}
              {form.photo_url && (
                <div className="mt-3 flex items-start gap-3">
                  <img src={form.photo_url} alt="Preview" className="w-24 h-16 object-cover border border-neutral-700" />
                  <button type="button" onClick={() => setForm(p => ({ ...p, photo_url: '' }))}
                    className="text-[9px] text-neutral-500 hover:text-white uppercase tracking-wider font-bold mt-1">
                    Quitar imagen
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
              {/* Sort order */}
              <div>
                <label className="block text-[9px] tracking-[0.2em] text-neutral-500 uppercase mb-2 font-bold">Orden</label>
                <input
                  name="sort_order" type="number" value={form.sort_order ?? 0} onChange={handleInput}
                  className="w-full bg-transparent border-b border-neutral-700 text-white text-sm py-2 outline-none focus:border-white transition-colors"
                />
              </div>

              {/* Active toggle */}
              <div className="flex flex-col justify-end">
                <label className="block text-[9px] tracking-[0.2em] text-neutral-500 uppercase mb-3 font-bold">Visible</label>
                <button
                  type="button"
                  onClick={() => setForm(p => ({ ...p, is_active: !p.is_active }))}
                  className={`w-10 h-5 relative transition-colors ${form.is_active ? 'bg-white' : 'bg-neutral-700'}`}
                  aria-pressed={form.is_active}
                >
                  <span className={`absolute top-0.5 w-4 h-4 bg-black transition-all ${form.is_active ? 'left-5' : 'left-0.5'}`} />
                </button>
              </div>
            </div>

            {error && <p className="text-xs text-red-400">{error}</p>}

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving}
                className="px-8 py-3 bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-200 transition-all disabled:opacity-50 flex items-center gap-2">
                {saving && <span className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />}
                {editId ? 'Guardar Cambios' : 'Añadir Reseña'}
              </button>
              {editId && (
                <button type="button" onClick={cancelEdit}
                  className="px-8 py-3 border border-neutral-700 text-neutral-400 text-[10px] font-bold uppercase tracking-widest hover:text-white hover:border-white transition-all">
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </section>

        {/* ── List ── */}
        <section>
          <h2 className="font-headline text-sm uppercase tracking-widest text-white mb-6">
            Reseñas ({reviews.length})
          </h2>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-7 h-7 border-2 border-neutral-700 border-t-white rounded-full animate-spin" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="flex flex-col items-center py-16 gap-3 border border-neutral-800">
              <span className="material-symbols-outlined text-4xl text-neutral-700">reviews</span>
              <p className="text-[10px] uppercase tracking-widest text-neutral-600 font-bold">Sin reseñas todavía</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reviews.map(r => (
                <div key={r.id}
                  className={`border p-5 flex gap-4 items-start transition-colors ${r.is_active ? 'border-neutral-800 bg-surface-container-low' : 'border-neutral-800/50 bg-transparent opacity-50'}`}
                >
                  {/* Photo thumbnail */}
                  <div className="w-16 h-16 flex-shrink-0 bg-neutral-900 border border-neutral-800 overflow-hidden">
                    {r.photo_url
                      ? <img src={r.photo_url} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center">
                          <span className="text-lg font-bold text-neutral-600 uppercase">{r.name[0]}</span>
                        </div>
                    }
                  </div>

                  {/* Info */}
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-[10px] font-bold text-white uppercase tracking-wider">{r.name}</p>
                      {r.location && <span className="text-[9px] text-neutral-600">· {r.location}</span>}
                      <div className="flex gap-0.5 ml-1">
                        {Array.from({ length: r.rating }).map((_, i) => (
                          <span key={i} className="material-symbols-outlined text-xs text-yellow-400" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-neutral-400 leading-relaxed line-clamp-2">&ldquo;{r.text}&rdquo;</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => toggleActive(r)} title={r.is_active ? 'Ocultar' : 'Mostrar'}
                      className={`p-1.5 transition-colors ${r.is_active ? 'text-neutral-400 hover:text-white' : 'text-neutral-700 hover:text-neutral-400'}`}>
                      <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: r.is_active ? "'FILL' 1" : "'FILL' 0" }}>visibility</span>
                    </button>
                    <button onClick={() => handleEdit(r)} title="Editar"
                      className="p-1.5 text-neutral-400 hover:text-white transition-colors">
                      <span className="material-symbols-outlined text-base">edit</span>
                    </button>
                    <button onClick={() => setDeleteTarget(r)} title="Eliminar"
                      className="p-1.5 text-neutral-700 hover:text-red-400 transition-colors">
                      <span className="material-symbols-outlined text-base">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Delete modal */}
      {deleteTarget && (
        <>
          <div className="fixed inset-0 bg-black/70 z-50" onClick={() => setDeleteTarget(null)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-neutral-900 border border-neutral-700 p-8 w-full max-w-sm">
            <h3 className="font-headline text-base uppercase tracking-widest text-white mb-3">Eliminar Reseña</h3>
            <p className="text-sm text-neutral-400 mb-6">¿Eliminar la reseña de <span className="text-white font-bold">{deleteTarget.name}</span>? Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <button onClick={confirmDelete}
                className="flex-1 py-3 bg-red-900 hover:bg-red-800 text-white text-[10px] font-bold uppercase tracking-widest transition-all">
                Eliminar
              </button>
              <button onClick={() => setDeleteTarget(null)}
                className="flex-1 py-3 border border-neutral-700 text-neutral-400 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-all">
                Cancelar
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
