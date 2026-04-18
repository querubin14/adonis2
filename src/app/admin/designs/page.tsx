'use client'

import { useState, useEffect, useCallback } from 'react'
import AdminSidebar from '@/components/AdminSidebar'
import { CldUploadWidget } from 'next-cloudinary'
import {
  getAllHeroes, insertHero, saveHero, deleteHero,
  getAllBentoItems, insertBentoItem, updateBentoItem, deleteBentoItem,
} from '@/lib/data'
import { HeroSettings, BentoItem } from '@/lib/types'

type Tab = 'hero' | 'bento'

/* ─── Hero helpers ─────────────────────────────────────────────── */
const HERO_EMPTY: Omit<HeroSettings, 'id' | 'updated_at'> = {
  title: '', subtitle: '', image_url: '', cta_text: '', cta_url: '', is_active: true, sort_order: 0,
}

/* ─── Bento helpers ────────────────────────────────────────────── */
const BENTO_EMPTY: Omit<BentoItem, 'id' | 'created_at'> = {
  title: '', subtitle: '', image_url: '', link_url: '/products', sort_order: 0, is_active: true,
}

export default function DesignsPage() {
  const [tab, setTab] = useState<Tab>('hero')

  /* ── Hero state ── */
  const [heroes, setHeroes] = useState<HeroSettings[]>([])
  const [heroLoading, setHeroLoading] = useState(true)
  const [heroForm, setHeroForm] = useState(HERO_EMPTY)
  const [heroEditing, setHeroEditing] = useState<HeroSettings | null>(null)
  const [heroShowForm, setHeroShowForm] = useState(false)
  const [heroSaving, setHeroSaving] = useState(false)
  const [heroDeleteTarget, setHeroDeleteTarget] = useState<HeroSettings | null>(null)
  const [heroUrlInput, setHeroUrlInput] = useState('')

  /* ── Bento state ── */
  const [bentoItems, setBentoItems] = useState<BentoItem[]>([])
  const [bentoLoading, setBentoLoading] = useState(true)
  const [bentoForm, setBentoForm] = useState(BENTO_EMPTY)
  const [bentoEditing, setBentoEditing] = useState<BentoItem | null>(null)
  const [bentoShowForm, setBentoShowForm] = useState(false)
  const [bentoSaving, setBentoSaving] = useState(false)
  const [bentoDeleteTarget, setBentoDeleteTarget] = useState<BentoItem | null>(null)
  const [bentoUrlInput, setBentoUrlInput] = useState('')
  const [bentoPhotoMode, setBentoPhotoMode] = useState<'url' | 'upload'>('url')

  /* ── Shared ── */
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  function msg(message: string, type: 'success' | 'error') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  /* ────────── Load ────────── */
  const loadHeroes = useCallback(async () => {
    setHeroLoading(true)
    try { setHeroes(await getAllHeroes()) } catch {}
    setHeroLoading(false)
  }, [])

  const loadBento = useCallback(async () => {
    setBentoLoading(true)
    try { setBentoItems(await getAllBentoItems()) } catch {}
    setBentoLoading(false)
  }, [])

  useEffect(() => {
    void (async () => {
      await loadHeroes()
      await loadBento()
    })()
  }, [loadHeroes, loadBento])

  /* ────────── Hero actions ────────── */
  function heroOpenNew() {
    setHeroEditing(null)
    setHeroForm({ ...HERO_EMPTY, sort_order: heroes.length })
    setHeroUrlInput('')
    setHeroShowForm(true)
  }

  function heroOpenEdit(h: HeroSettings) {
    setHeroEditing(h)
    setHeroForm({ title: h.title ?? '', subtitle: h.subtitle ?? '', image_url: h.image_url ?? '', cta_text: h.cta_text ?? '', cta_url: h.cta_url ?? '', is_active: h.is_active ?? true, sort_order: h.sort_order ?? 0 })
    setHeroUrlInput('')
    setHeroShowForm(true)
    setTimeout(() => document.getElementById('hero-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  function heroCloseForm() { setHeroEditing(null); setHeroShowForm(false) }

  function heroInput(e: React.ChangeEvent<HTMLInputElement>) {
    setHeroForm(p => ({ ...p, [e.target.name]: e.target.value }))
  }

  async function heroSubmit(e: React.FormEvent) {
    e.preventDefault()
    setHeroSaving(true)
    try {
      const payload = { title: heroForm.title.trim(), subtitle: heroForm.subtitle?.trim() || null, image_url: heroForm.image_url?.trim() || null, cta_text: heroForm.cta_text?.trim() || null, cta_url: heroForm.cta_url?.trim() || null, is_active: heroForm.is_active, sort_order: Number(heroForm.sort_order) || 0 }
      if (heroEditing) { await saveHero(heroEditing.id, payload); msg('Hero actualizado.', 'success') }
      else { await insertHero(payload); msg('Hero creado.', 'success') }
      heroCloseForm(); await loadHeroes()
    } catch (err: unknown) { 
      const error = err as Error
      msg('Error: ' + (error.message ?? ''), 'error') 
    }
    setHeroSaving(false)
  }

  async function heroDeleteConfirm() {
    if (!heroDeleteTarget) return
    try { 
      await deleteHero(heroDeleteTarget.id)
      msg('Hero eliminado.', 'success')
      setHeroDeleteTarget(null)
      await loadHeroes() 
    } catch (err: unknown) { 
      const error = err as Error
      msg('Error: ' + (error.message ?? ''), 'error') 
    }
  }

  /* ────────── Bento actions ────────── */
  function bentoOpenNew() {
    setBentoEditing(null)
    setBentoForm({ ...BENTO_EMPTY, sort_order: bentoItems.length })
    setBentoUrlInput('')
    setBentoShowForm(true)
  }

  function bentoOpenEdit(b: BentoItem) {
    setBentoEditing(b)
    setBentoForm({ title: b.title, subtitle: b.subtitle ?? '', image_url: b.image_url ?? '', link_url: b.link_url ?? '/products', sort_order: b.sort_order ?? 0, is_active: b.is_active ?? true })
    setBentoUrlInput('')
    setBentoShowForm(true)
    setTimeout(() => document.getElementById('bento-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  function bentoCloseForm() { setBentoEditing(null); setBentoShowForm(false) }

  function bentoInput(e: React.ChangeEvent<HTMLInputElement>) {
    setBentoForm(p => ({ ...p, [e.target.name]: e.target.value }))
  }

  async function bentoSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!bentoForm.title.trim()) { msg('El título es obligatorio.', 'error'); return }
    setBentoSaving(true)
    try {
      const payload = { title: bentoForm.title.trim(), subtitle: bentoForm.subtitle?.trim() || null, image_url: bentoForm.image_url?.trim() || null, link_url: bentoForm.link_url?.trim() || '/products', sort_order: Number(bentoForm.sort_order) || 0, is_active: bentoForm.is_active }
      if (bentoEditing) { await updateBentoItem(bentoEditing.id, payload); msg('Tile actualizado.', 'success') }
      else { await insertBentoItem(payload); msg('Tile creado.', 'success') }
      bentoCloseForm(); await loadBento()
    } catch (err: unknown) { 
      const error = err as Error
      msg('Error: ' + (error.message ?? ''), 'error') 
    }
    setBentoSaving(false)
  }

  async function bentoDeleteConfirm() {
    if (!bentoDeleteTarget) return
    try {
      await deleteBentoItem(bentoDeleteTarget.id)
      msg('Tile eliminado.', 'success')
      setBentoDeleteTarget(null)
      await loadBento()
    } catch (err: unknown) {
      const error = err as Error
      msg('Error: ' + (error.message ?? ''), 'error')
    }
  }

  async function bentoToggleActive(b: BentoItem) {
    try {
      await updateBentoItem(b.id, { is_active: !b.is_active })
      setBentoItems(prev => prev.map(x => x.id === b.id ? { ...x, is_active: !x.is_active } : x))
    } catch {}
  }

  /* ────────── Render ────────── */
  return (
    <div className="flex min-h-screen bg-background text-on-background font-body">

      {/* Toast */}
      {toast && (
        <div role="alert" className={`fixed top-5 right-5 z-[100] flex items-center gap-3 px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest shadow-xl ${toast.type === 'success' ? 'bg-white text-black' : 'bg-red-900 text-white'}`}>
          <span className="material-symbols-outlined text-sm">{toast.type === 'success' ? 'check_circle' : 'error'}</span>
          {toast.message}
        </div>
      )}

      {/* Delete modals */}
      {heroDeleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-surface-container border border-outline-variant/20 p-10 max-w-sm w-full">
            <h3 className="font-headline text-white text-base uppercase tracking-widest mb-2">Eliminar Hero</h3>
            <p className="text-neutral-300 text-sm mb-6">&ldquo;{heroDeleteTarget.title}&rdquo;</p>
            <div className="flex gap-3">
              <button onClick={heroDeleteConfirm} className="flex-1 bg-red-900 text-white py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-red-800">Eliminar</button>
              <button onClick={() => setHeroDeleteTarget(null)} className="flex-1 border border-neutral-700 text-neutral-400 py-3 text-[10px] font-bold uppercase tracking-widest hover:text-white hover:border-white transition-all">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {bentoDeleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-surface-container border border-outline-variant/20 p-10 max-w-sm w-full">
            <h3 className="font-headline text-white text-base uppercase tracking-widest mb-2">Eliminar Tile</h3>
            <p className="text-neutral-300 text-sm mb-6">&ldquo;{bentoDeleteTarget.title}&rdquo;</p>
            <div className="flex gap-3">
              <button onClick={bentoDeleteConfirm} className="flex-1 bg-red-900 text-white py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-red-800">Eliminar</button>
              <button onClick={() => setBentoDeleteTarget(null)} className="flex-1 border border-neutral-700 text-neutral-400 py-3 text-[10px] font-bold uppercase tracking-widest hover:text-white hover:border-white transition-all">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      <AdminSidebar />

      <main className="ml-56 flex-grow flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-outline-variant/10 px-10 py-5 flex items-center justify-between">
          <div>
            <h2 className="font-headline text-base text-white uppercase tracking-[0.2em]">Diseños</h2>
            <p className="text-[9px] text-neutral-500 uppercase tracking-widest mt-0.5">Gestión visual del sitio</p>
          </div>
          <button
            onClick={() => { if (tab === 'hero') heroOpenNew(); else bentoOpenNew() }}
            className="flex items-center gap-2 bg-white text-black px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-200 transition-all"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            {tab === 'hero' ? 'Nuevo Hero' : 'Nuevo Tile'}
          </button>
        </header>

        {/* Tab bar */}
        <div className="border-b border-neutral-800 px-10 flex gap-0">
          {([
            { key: 'hero', label: 'Hero Slider', icon: 'slideshow' },
            { key: 'bento', label: 'Explorar Categorías', icon: 'grid_view' },
          ] as { key: Tab; label: string; icon: string }[]).map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-6 py-4 text-[10px] font-bold uppercase tracking-widest border-b-2 transition-all ${
                tab === t.key
                  ? 'border-white text-white'
                  : 'border-transparent text-neutral-500 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-sm">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-10 flex-grow space-y-8">

          {/* ═══════════════ HERO TAB ═══════════════ */}
          {tab === 'hero' && (
            <>
              <div className="flex items-start gap-3 bg-surface-container-low border border-outline-variant/10 p-4">
                <span className="material-symbols-outlined text-sm text-neutral-500 flex-shrink-0 mt-0.5">info</span>
                <p className="text-[9px] text-neutral-400 leading-relaxed">
                  Los heroes activos se muestran como slider en la página principal, rotando cada 5 segundos. El número de orden más bajo aparece primero.
                </p>
              </div>

              {/* SQL hint */}
              {!heroLoading && heroes.length === 0 && (
                <div className="bg-surface-container-low border border-neutral-700 p-6 space-y-4">
                  <p className="text-[9px] text-neutral-400 uppercase tracking-widest font-bold">Ejecuta este SQL en Supabase:</p>
                  <pre className="bg-background border border-neutral-800 p-4 text-xs text-neutral-300 font-mono overflow-x-auto">{`ALTER TABLE hero_settings
  ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0;

-- RLS policies
CREATE POLICY "hero_insert" ON hero_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "hero_delete" ON hero_settings FOR DELETE USING (true);`}</pre>
                </div>
              )}

              {/* Hero form */}
              {heroShowForm && (
                <div id="hero-form" className="bg-surface-container-low border border-outline-variant/10 p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-[9px] uppercase tracking-[0.35em] text-neutral-400 font-bold">
                      {heroEditing ? `Editando: ${heroEditing.title}` : 'Nuevo Hero'}
                    </h3>
                    <button onClick={heroCloseForm} className="p-1.5 text-neutral-500 hover:text-white transition-colors">
                      <span className="material-symbols-outlined text-base">close</span>
                    </button>
                  </div>

                  <form onSubmit={heroSubmit} noValidate>
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                      <div className="space-y-5">
                        {[
                          { id: 'h-title', name: 'title', label: 'Título *', placeholder: 'Precisión Etérea', value: heroForm.title },
                          { id: 'h-sub', name: 'subtitle', label: 'Subtítulo', placeholder: 'Exposición Otoño 2024', value: heroForm.subtitle ?? '' },
                        ].map(f => (
                          <div key={f.id}>
                            <label htmlFor={f.id} className="block text-[9px] tracking-[0.25em] text-neutral-500 uppercase mb-2 font-bold">{f.label}</label>
                            <input id={f.id} name={f.name} value={f.value} onChange={heroInput} placeholder={f.placeholder}
                              className="w-full bg-transparent border-b border-neutral-800 text-white text-sm py-2.5 outline-none focus:border-white transition-colors placeholder:text-neutral-700" />
                          </div>
                        ))}

                        <div className="grid grid-cols-2 gap-4">
                          {[
                            { id: 'h-ctat', name: 'cta_text', label: 'Texto botón', placeholder: 'Explorar', value: heroForm.cta_text ?? '' },
                            { id: 'h-ctau', name: 'cta_url', label: 'URL botón', placeholder: '/products', value: heroForm.cta_url ?? '' },
                          ].map(f => (
                            <div key={f.id}>
                              <label htmlFor={f.id} className="block text-[9px] tracking-[0.25em] text-neutral-500 uppercase mb-2 font-bold">{f.label}</label>
                              <input id={f.id} name={f.name} value={f.value} onChange={heroInput} placeholder={f.placeholder}
                                className="w-full bg-transparent border-b border-neutral-800 text-white text-sm py-2.5 outline-none focus:border-white transition-colors placeholder:text-neutral-700" />
                            </div>
                          ))}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[9px] tracking-[0.25em] text-neutral-500 uppercase mb-2 font-bold">Orden</label>
                            <input name="sort_order" type="number" min="0" value={heroForm.sort_order ?? 0} onChange={heroInput}
                              className="w-full bg-transparent border-b border-neutral-800 text-white text-sm py-2.5 outline-none focus:border-white transition-colors" />
                          </div>
                          <div className="flex items-end pb-2.5">
                            <label className="flex items-center gap-3 cursor-pointer">
                              <div className={`w-10 h-5 flex-shrink-0 transition-colors relative ${heroForm.is_active ? 'bg-white' : 'bg-neutral-700'}`}
                                onClick={() => setHeroForm(p => ({ ...p, is_active: !p.is_active }))}>
                                <span className={`absolute top-0.5 w-4 h-4 bg-black transition-transform ${heroForm.is_active ? 'translate-x-5' : 'translate-x-0.5'}`} />
                              </div>
                              <span className="text-[9px] uppercase tracking-[0.25em] text-neutral-400 font-bold">{heroForm.is_active ? 'Activo' : 'Inactivo'}</span>
                            </label>
                          </div>
                        </div>

                        {/* Image upload */}
                        <div>
                          <p className="text-[9px] tracking-[0.25em] text-neutral-500 uppercase mb-3 font-bold">Imagen de fondo</p>
                          <CldUploadWidget
                            uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                            onSuccess={(r) => { 
                              const info = r.info as { secure_url?: string }
                              if (info?.secure_url) setHeroForm(p => ({ ...p, image_url: info.secure_url })) 
                            }}
                          >
                            {({ open }) => (
                              <button type="button" onClick={() => open()}
                                className="w-full border-2 border-dashed border-neutral-700 hover:border-white py-5 flex flex-col items-center gap-2 group transition-all mb-3">
                                <span className="material-symbols-outlined text-2xl text-neutral-600 group-hover:text-white transition-colors">cloud_upload</span>
                                <p className="text-[9px] uppercase tracking-widest text-neutral-500 group-hover:text-white transition-colors font-bold">Subir desde PC</p>
                              </button>
                            )}
                          </CldUploadWidget>
                          <div className="flex gap-2">
                            <input type="url" value={heroUrlInput} onChange={e => setHeroUrlInput(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (heroUrlInput.trim()) { setHeroForm(p => ({ ...p, image_url: heroUrlInput.trim() })); setHeroUrlInput('') } } }}
                              placeholder="O pega una URL..."
                              className="flex-1 bg-transparent border-b border-neutral-800 text-white text-xs py-2 outline-none focus:border-white transition-colors placeholder:text-neutral-700" />
                            <button type="button" onClick={() => { if (heroUrlInput.trim()) { setHeroForm(p => ({ ...p, image_url: heroUrlInput.trim() })); setHeroUrlInput('') } }}
                              className="px-3 py-1.5 bg-white text-black text-[9px] font-bold uppercase tracking-widest hover:bg-neutral-200 transition-all flex-shrink-0">
                              Aplicar
                            </button>
                          </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                          <button type="submit" disabled={heroSaving}
                            className="flex-1 bg-white text-black py-3.5 text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-200 disabled:opacity-50 flex items-center justify-center gap-2">
                            {heroSaving && <span className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />}
                            {heroEditing ? 'Actualizar' : 'Crear Hero'}
                          </button>
                          <button type="button" onClick={heroCloseForm}
                            className="px-6 py-3.5 border border-neutral-700 text-neutral-400 text-[10px] font-bold uppercase tracking-widest hover:text-white hover:border-white transition-all">
                            Cancelar
                          </button>
                        </div>
                      </div>

                      {/* Hero preview */}
                      <div>
                        <p className="text-[9px] uppercase tracking-[0.35em] text-neutral-500 font-bold mb-3">Vista previa</p>
                        <div className="relative overflow-hidden aspect-video bg-neutral-950 border border-neutral-800">
                          {heroForm.image_url
                            ? <img src={heroForm.image_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
                            : <div className="absolute inset-0 flex items-center justify-center"><span className="material-symbols-outlined text-6xl text-neutral-800">image</span></div>
                          }
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                          <div className="absolute bottom-0 left-0 right-0 p-4">
                            <span className="font-label uppercase tracking-[0.45em] text-[7px] text-secondary mb-1 block font-bold">{heroForm.subtitle || 'Subtítulo'}</span>
                            <h2 className="font-headline text-lg text-white uppercase leading-tight tracking-tight mb-2">{heroForm.title || 'Título del Hero'}</h2>
                            {heroForm.cta_text && <span className="px-4 py-1.5 bg-white text-black text-[7px] font-bold uppercase tracking-wider inline-block">{heroForm.cta_text}</span>}
                          </div>
                          {!heroForm.is_active && <div className="absolute top-3 right-3 bg-neutral-800/80 px-2 py-0.5"><span className="text-[7px] uppercase tracking-widest text-neutral-400 font-bold">Inactivo</span></div>}
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              )}

              {/* Heroes list */}
              {heroLoading ? (
                <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-neutral-700 border-t-white rounded-full animate-spin" /></div>
              ) : heroes.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {heroes.map((h, idx) => (
                    <div key={h.id} className={`bg-surface-container-low border overflow-hidden ${h.is_active ? 'border-neutral-800' : 'border-neutral-800 opacity-60'}`}>
                      <div className="relative aspect-video overflow-hidden bg-neutral-950">
                        {h.image_url ? <img src={h.image_url} alt={h.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><span className="material-symbols-outlined text-4xl text-neutral-800">image</span></div>}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                        <div className="absolute top-2 left-2 bg-white/10 backdrop-blur-sm px-2 py-0.5"><span className="text-[8px] uppercase tracking-widest text-white font-bold">#{idx + 1}</span></div>
                        <div className={`absolute top-2 right-2 px-2 py-0.5 ${h.is_active ? 'bg-emerald-900/70' : 'bg-neutral-800/70'}`}><span className={`text-[7px] uppercase tracking-widest font-bold ${h.is_active ? 'text-emerald-400' : 'text-neutral-500'}`}>{h.is_active ? 'Activo' : 'Inactivo'}</span></div>
                        <div className="absolute bottom-0 left-0 right-0 p-3"><p className="font-headline text-sm text-white uppercase tracking-wide leading-tight line-clamp-1">{h.title}</p></div>
                      </div>
                      <div className="flex items-center justify-between px-4 py-3">
                        <span className="text-[8px] text-neutral-500 font-bold uppercase tracking-wider">Orden: {h.sort_order ?? 0}</span>
                        <div className="flex gap-1">
                          <button onClick={() => heroOpenEdit(h)} className="p-2 text-neutral-500 hover:text-white hover:bg-neutral-800 transition-all"><span className="material-symbols-outlined text-sm">edit</span></button>
                          <button onClick={() => setHeroDeleteTarget(h)} className="p-2 text-neutral-500 hover:text-red-400 hover:bg-red-900/20 transition-all"><span className="material-symbols-outlined text-sm">delete</span></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ═══════════════ BENTO TAB ═══════════════ */}
          {tab === 'bento' && (
            <>
              <div className="flex items-start gap-3 bg-surface-container-low border border-outline-variant/10 p-4">
                <span className="material-symbols-outlined text-sm text-neutral-500 flex-shrink-0 mt-0.5">info</span>
                  <p className="text-[9px] text-neutral-400 leading-relaxed">
                    Los tiles activos aparecen en la sección &ldquo;Explorar Categorías&rdquo; del home. El primero (orden 0) ocupa doble espacio. Cada tile puede tener imagen, título y un enlace.
                  </p>
              </div>

              {/* SQL hint */}
              {!bentoLoading && bentoItems.length === 0 && (
                <div className="bg-surface-container-low border border-neutral-700 p-6 space-y-4">
                  <p className="text-[9px] text-neutral-400 uppercase tracking-widest font-bold">Ejecuta este SQL en Supabase:</p>
                  <pre className="bg-background border border-neutral-800 p-4 text-xs text-neutral-300 font-mono overflow-x-auto">{`CREATE TABLE bento_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  subtitle text,
  image_url text,
  link_url text DEFAULT '/products',
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);`}</pre>
                </div>
              )}

              {/* Bento form */}
              {bentoShowForm && (
                <div id="bento-form" className="bg-surface-container-low border border-outline-variant/10 p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-[9px] uppercase tracking-[0.35em] text-neutral-400 font-bold">
                      {bentoEditing ? `Editando: ${bentoEditing.title}` : 'Nuevo Tile'}
                    </h3>
                    <button onClick={bentoCloseForm} className="p-1.5 text-neutral-500 hover:text-white transition-colors">
                      <span className="material-symbols-outlined text-base">close</span>
                    </button>
                  </div>

                  <form onSubmit={bentoSubmit} noValidate>
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                      <div className="space-y-5">
                        {[
                          { name: 'title', label: 'Título *', placeholder: 'Pulseras', value: bentoForm.title },
                          { name: 'subtitle', label: 'Subtítulo', placeholder: 'Nueva colección', value: bentoForm.subtitle ?? '' },
                          { name: 'link_url', label: 'Enlace (URL)', placeholder: '/products', value: bentoForm.link_url ?? '' },
                        ].map(f => (
                          <div key={f.name}>
                            <label className="block text-[9px] tracking-[0.25em] text-neutral-500 uppercase mb-2 font-bold">{f.label}</label>
                            <input name={f.name} value={f.value} onChange={bentoInput} placeholder={f.placeholder}
                              className="w-full bg-transparent border-b border-neutral-800 text-white text-sm py-2.5 outline-none focus:border-white transition-colors placeholder:text-neutral-700" />
                          </div>
                        ))}

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[9px] tracking-[0.25em] text-neutral-500 uppercase mb-2 font-bold">Orden</label>
                            <input name="sort_order" type="number" min="0" value={bentoForm.sort_order ?? 0} onChange={bentoInput}
                              className="w-full bg-transparent border-b border-neutral-800 text-white text-sm py-2.5 outline-none focus:border-white transition-colors" />
                            <p className="text-[8px] text-neutral-600 mt-1">Orden 0 = tile grande</p>
                          </div>
                          <div className="flex items-end pb-2.5">
                            <label className="flex items-center gap-3 cursor-pointer">
                              <div className={`w-10 h-5 flex-shrink-0 transition-colors relative ${bentoForm.is_active ? 'bg-white' : 'bg-neutral-700'}`}
                                onClick={() => setBentoForm(p => ({ ...p, is_active: !p.is_active }))}>
                                <span className={`absolute top-0.5 w-4 h-4 bg-black transition-transform ${bentoForm.is_active ? 'translate-x-5' : 'translate-x-0.5'}`} />
                              </div>
                              <span className="text-[9px] uppercase tracking-[0.25em] text-neutral-400 font-bold">{bentoForm.is_active ? 'Visible' : 'Oculto'}</span>
                            </label>
                          </div>
                        </div>

                        {/* Image */}
                        <div>
                          <p className="text-[9px] tracking-[0.25em] text-neutral-500 uppercase mb-3 font-bold">Imagen del tile</p>
                          <div className="flex gap-1 mb-3">
                            {(['url', 'upload'] as const).map(m => (
                              <button key={m} type="button" onClick={() => setBentoPhotoMode(m)}
                                className={`px-3 py-1 text-[9px] font-bold uppercase tracking-widest transition-all ${bentoPhotoMode === m ? 'bg-white text-black' : 'border border-neutral-700 text-neutral-500 hover:text-white hover:border-white'}`}>
                                {m === 'url' ? 'URL' : 'Subir'}
                              </button>
                            ))}
                          </div>

                          {bentoPhotoMode === 'url' ? (
                            <div className="flex gap-2">
                              <input type="url" value={bentoUrlInput} onChange={e => setBentoUrlInput(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (bentoUrlInput.trim()) { setBentoForm(p => ({ ...p, image_url: bentoUrlInput.trim() })); setBentoUrlInput('') } } }}
                                placeholder="https://..."
                                className="flex-1 bg-transparent border-b border-neutral-800 text-white text-xs py-2 outline-none focus:border-white transition-colors placeholder:text-neutral-700" />
                              <button type="button" onClick={() => { if (bentoUrlInput.trim()) { setBentoForm(p => ({ ...p, image_url: bentoUrlInput.trim() })); setBentoUrlInput('') } }}
                                className="px-3 py-1.5 bg-white text-black text-[9px] font-bold uppercase tracking-widest hover:bg-neutral-200 transition-all flex-shrink-0">
                                Aplicar
                              </button>
                            </div>
                          ) : (
                            <CldUploadWidget
                              uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                              onSuccess={(r) => { 
                              const info = r.info as { secure_url?: string }
                              if (info?.secure_url) setBentoForm(p => ({ ...p, image_url: info.secure_url })) 
                            }}
                            >
                              {({ open }) => (
                                <button type="button" onClick={() => open()}
                                  className="w-full border-2 border-dashed border-neutral-700 hover:border-white py-5 flex flex-col items-center gap-2 group transition-all">
                                  <span className="material-symbols-outlined text-2xl text-neutral-600 group-hover:text-white transition-colors">cloud_upload</span>
                                  <p className="text-[9px] uppercase tracking-widest text-neutral-500 group-hover:text-white transition-colors font-bold">Subir desde PC</p>
                                </button>
                              )}
                            </CldUploadWidget>
                          )}

                          {bentoForm.image_url && (
                            <div className="mt-3 flex items-start gap-3">
                              <img src={bentoForm.image_url} alt="" className="w-24 h-14 object-cover border border-neutral-700" />
                              <button type="button" onClick={() => setBentoForm(p => ({ ...p, image_url: '' }))}
                                className="text-[9px] text-neutral-500 hover:text-white uppercase tracking-wider font-bold mt-1">× Quitar</button>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-3 pt-2">
                          <button type="submit" disabled={bentoSaving}
                            className="flex-1 bg-white text-black py-3.5 text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-200 disabled:opacity-50 flex items-center justify-center gap-2">
                            {bentoSaving && <span className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />}
                            {bentoEditing ? 'Actualizar Tile' : 'Crear Tile'}
                          </button>
                          <button type="button" onClick={bentoCloseForm}
                            className="px-6 py-3.5 border border-neutral-700 text-neutral-400 text-[10px] font-bold uppercase tracking-widest hover:text-white hover:border-white transition-all">
                            Cancelar
                          </button>
                        </div>
                      </div>

                      {/* Bento preview */}
                      <div>
                        <p className="text-[9px] uppercase tracking-[0.35em] text-neutral-500 font-bold mb-3">Vista previa del tile</p>
                        <div className="relative overflow-hidden aspect-[4/3] bg-neutral-950 border border-neutral-800">
                          {bentoForm.image_url
                            ? <img src={bentoForm.image_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
                            : <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 to-neutral-950" />
                          }
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                          <div className="absolute bottom-0 left-0 right-0 p-5 flex items-end justify-between">
                            <div>
                              {bentoForm.subtitle && <p className="text-[8px] uppercase tracking-[0.4em] text-neutral-400 font-bold mb-1">{bentoForm.subtitle}</p>}
                              <h3 className="font-headline text-xl text-white uppercase tracking-tight">{bentoForm.title || 'Título del Tile'}</h3>
                            </div>
                            <span className="material-symbols-outlined text-white/60 text-lg">arrow_forward</span>
                          </div>
                          <div className="absolute top-4 right-4 w-1.5 h-1.5 bg-neutral-600" />
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              )}

              {/* Bento items list */}
              {bentoLoading ? (
                <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-neutral-700 border-t-white rounded-full animate-spin" /></div>
              ) : bentoItems.length === 0 ? (
                <div className="flex flex-col items-center py-16 gap-3 border border-neutral-800">
                  <span className="material-symbols-outlined text-4xl text-neutral-700">grid_view</span>
                  <p className="text-[10px] uppercase tracking-widest text-neutral-600 font-bold">Sin tiles — crea el primero</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {bentoItems.map((b, idx) => (
                    <div key={b.id} className={`border overflow-hidden transition-opacity ${b.is_active ? 'border-neutral-800 bg-surface-container-low' : 'border-neutral-800/50 opacity-50'}`}>
                      <div className="relative aspect-[4/3] bg-neutral-950">
                        {b.image_url ? <img src={b.image_url} alt={b.title} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gradient-to-br from-neutral-900 to-neutral-950 flex items-center justify-center"><span className="material-symbols-outlined text-4xl text-neutral-800">image</span></div>}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                        <div className="absolute top-2 left-2 bg-white/10 backdrop-blur-sm px-2 py-0.5"><span className="text-[8px] uppercase tracking-widest text-white font-bold">#{idx + 1}</span></div>
                        <div className={`absolute top-2 right-2 px-2 py-0.5 ${b.is_active ? 'bg-emerald-900/70' : 'bg-neutral-800/70'}`}>
                          <span className={`text-[7px] uppercase tracking-widest font-bold ${b.is_active ? 'text-emerald-400' : 'text-neutral-500'}`}>{b.is_active ? 'Visible' : 'Oculto'}</span>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <p className="font-headline text-sm text-white uppercase tracking-wide leading-tight">{b.title}</p>
                          {b.subtitle && <p className="text-[8px] text-neutral-400 mt-0.5">{b.subtitle}</p>}
                        </div>
                      </div>
                      <div className="flex items-center justify-between px-4 py-3">
                        <span className="text-[8px] text-neutral-500 font-bold uppercase tracking-wider truncate max-w-[120px]">{b.link_url}</span>
                        <div className="flex gap-1">
                          <button onClick={() => bentoToggleActive(b)} title={b.is_active ? 'Ocultar' : 'Mostrar'}
                            className="p-2 text-neutral-500 hover:text-white hover:bg-neutral-800 transition-all">
                            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: b.is_active ? "'FILL' 1" : "'FILL' 0" }}>visibility</span>
                          </button>
                          <button onClick={() => bentoOpenEdit(b)} className="p-2 text-neutral-500 hover:text-white hover:bg-neutral-800 transition-all"><span className="material-symbols-outlined text-sm">edit</span></button>
                          <button onClick={() => setBentoDeleteTarget(b)} className="p-2 text-neutral-500 hover:text-red-400 hover:bg-red-900/20 transition-all"><span className="material-symbols-outlined text-sm">delete</span></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

        </div>
      </main>
    </div>
  )
}
