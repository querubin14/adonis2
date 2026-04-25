'use client'

import { useState, useEffect } from 'react'
import AdminSidebar from '@/components/AdminSidebar'
import Link from 'next/link'
import { getAllNavLinks, insertNavLink, updateNavLink, deleteNavLink } from '@/lib/data'
import { NavLink } from '@/lib/types'

const EMPTY_FORM = {
  label: '',
  url: '/products',
  parent_id: '' as string,
  sort_order: 0,
  is_active: true,
}

type FormState = typeof EMPTY_FORM

function buildNavTree(flat: NavLink[]): NavLink[] {
  const map = new Map<string, NavLink>()
  flat.forEach(n => map.set(n.id, { ...n, children: [] }))
  const roots: NavLink[] = []
  map.forEach(node => {
    if (node.parent_id && map.has(node.parent_id)) {
      map.get(node.parent_id)!.children!.push(node)
    } else {
      roots.push(node)
    }
  })
  function sort(nodes: NavLink[]): NavLink[] {
    return nodes
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      .map(n => ({ ...n, children: sort(n.children ?? []) }))
  }
  return sort(roots)
}

export default function NavigationAdminPage() {
  const [links, setLinks] = useState<NavLink[]>([])
  const [flat, setFlat] = useState<NavLink[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<NavLink | null>(null)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    const data = await getAllNavLinks()
    setFlat(data)
    setLinks(buildNavTree(data))
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function handleInput(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value, type } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
        : name === 'sort_order' ? Number(value) : value,
    }))
  }

  function startEdit(link: NavLink) {
    setEditingId(link.id)
    setForm({
      label: link.label,
      url: link.url,
      parent_id: link.parent_id ?? '',
      sort_order: link.sort_order ?? 0,
      is_active: link.is_active ?? true,
    })
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.label.trim() || !form.url.trim()) {
      setError('El nombre y la URL son obligatorios.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const payload = {
        label: form.label.trim(),
        url: form.url.trim(),
        parent_id: form.parent_id || null,
        sort_order: form.sort_order,
        is_active: form.is_active,
      }
      if (editingId) {
        await updateNavLink(editingId, payload)
      } else {
        await insertNavLink(payload)
      }
      cancelEdit()
      await load()
    } catch (err: any) {
      setError(err.message ?? 'Error al guardar.')
    } finally {
      setSaving(false)
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    setSaving(true)
    try {
      await deleteNavLink(deleteTarget.id)
      setDeleteTarget(null)
      await load()
    } catch (err: any) {
      setError(err.message ?? 'Error al eliminar.')
    } finally {
      setSaving(false)
    }
  }

  // Parents available for selection — exclude the link being edited and its children
  function availableParents(editId: string | null): NavLink[] {
    if (!editId) return flat
    const childIds = new Set<string>()
    function collectChildren(id: string) {
      childIds.add(id)
      flat.filter(n => n.parent_id === id).forEach(n => collectChildren(n.id))
    }
    collectChildren(editId)
    return flat.filter(n => !childIds.has(n.id))
  }

  function renderLinkRow(link: NavLink, depth = 0) {
    return (
      <div key={link.id}>
        <div className={`flex items-center gap-3 px-5 py-3.5 border-b border-neutral-800/50 hover:bg-neutral-900/30 transition-colors ${depth > 0 ? 'pl-12' : ''}`}>
          {depth > 0 && (
            <span className="text-neutral-700 text-xs mr-1" aria-hidden="true">└</span>
          )}
          <div className="flex-grow min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-headline text-xs text-white uppercase tracking-wide">{link.label}</span>
              <span className="text-[9px] text-neutral-500 font-mono truncate">{link.url}</span>
              {!link.is_active && (
                <span className="text-[8px] uppercase tracking-wider text-neutral-600 border border-neutral-700 px-1.5 py-0.5">
                  Inactivo
                </span>
              )}
              {link.children && link.children.length > 0 && (
                <span className="text-[8px] uppercase tracking-wider text-neutral-500">
                  {link.children.length} sub{link.children.length !== 1 ? 'enlaces' : 'enlace'}
                </span>
              )}
            </div>
            <p className="text-[9px] text-neutral-700 mt-0.5">Orden: {link.sort_order ?? 0}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => startEdit(link)}
              className="p-1.5 text-neutral-500 hover:text-white transition-colors"
              aria-label={`Editar ${link.label}`}
            >
              <span className="material-symbols-outlined text-base" aria-hidden="true">edit</span>
            </button>
            <button
              onClick={() => setDeleteTarget(link)}
              className="p-1.5 text-neutral-500 hover:text-red-400 transition-colors"
              aria-label={`Eliminar ${link.label}`}
            >
              <span className="material-symbols-outlined text-base" aria-hidden="true">delete</span>
            </button>
          </div>
        </div>
        {link.children?.map(child => renderLinkRow(child, depth + 1))}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-on-background flex">
      <AdminSidebar />

      <main className="ml-56 flex-grow p-8 max-w-3xl">
        <div className="mb-8 flex flex-col">
          <Link 
            href="/admin" 
            className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-neutral-500 hover:text-white mb-4 transition-colors group"
          >
            <span className="material-symbols-outlined text-xs group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
            Volver al Panel
          </Link>
          <div className="flex flex-col">
            <p className="text-[9px] uppercase tracking-[0.45em] text-neutral-500 font-bold mb-1">Admin</p>
            <h1 className="font-headline text-2xl uppercase tracking-tight text-white">Navegación</h1>
            <p className="text-xs text-neutral-500 mt-1">Gestiona los enlaces del menú principal. Los hijos aparecen como submenú.</p>
          </div>
        </div>

        {/* SQL hint */}
        <div className="bg-neutral-900 border border-neutral-700 rounded p-4 mb-8 text-[10px] text-neutral-400 space-y-1.5">
          <p className="font-bold text-neutral-300 uppercase tracking-wider text-[9px] mb-2">SQL requerido en Supabase</p>
          <pre className="text-[9px] text-neutral-500 leading-relaxed overflow-x-auto whitespace-pre-wrap">{`CREATE TABLE nav_links (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  label text NOT NULL,
  url text NOT NULL DEFAULT '/products',
  parent_id uuid REFERENCES nav_links(id) ON DELETE SET NULL,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE nav_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read" ON nav_links FOR SELECT USING (true);
CREATE POLICY "anon write" ON nav_links FOR ALL USING (true) WITH CHECK (true);`}</pre>
        </div>

        {/* Form */}
        <section className="bg-neutral-900 border border-neutral-800 p-6 mb-8">
          <h2 className="font-headline text-sm uppercase tracking-widest text-white mb-5">
            {editingId ? 'Editar enlace' : 'Nuevo enlace'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] uppercase tracking-[0.2em] text-neutral-500 font-bold mb-1.5">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  name="label"
                  value={form.label}
                  onChange={handleInput}
                  required
                  placeholder="ej. Alta Joyería"
                  className="w-full bg-transparent border-b border-neutral-700 text-white text-sm py-2 outline-none focus:border-white transition-colors placeholder:text-neutral-700"
                />
              </div>
              <div>
                <label className="block text-[9px] uppercase tracking-[0.2em] text-neutral-500 font-bold mb-1.5">
                  URL <span className="text-red-500">*</span>
                </label>
                <input
                  name="url"
                  value={form.url}
                  onChange={handleInput}
                  required
                  placeholder="/products"
                  className="w-full bg-transparent border-b border-neutral-700 text-white text-sm py-2 outline-none focus:border-white transition-colors placeholder:text-neutral-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] uppercase tracking-[0.2em] text-neutral-500 font-bold mb-1.5">
                  Enlace padre (opcional)
                </label>
                <select
                  name="parent_id"
                  value={form.parent_id}
                  onChange={handleInput}
                  className="w-full bg-neutral-800 border border-neutral-700 text-white text-xs py-2.5 px-3 outline-none focus:border-white transition-colors"
                >
                  <option value="">— Ninguno (nivel raíz) —</option>
                  {availableParents(editingId).map(p => (
                    <option key={p.id} value={p.id}>{p.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[9px] uppercase tracking-[0.2em] text-neutral-500 font-bold mb-1.5">
                  Orden
                </label>
                <input
                  name="sort_order"
                  value={form.sort_order}
                  onChange={handleInput}
                  type="number"
                  min={0}
                  className="w-full bg-transparent border-b border-neutral-700 text-white text-sm py-2 outline-none focus:border-white transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                checked={form.is_active}
                onChange={handleInput}
                className="w-4 h-4 accent-white"
              />
              <label htmlFor="is_active" className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold cursor-pointer">
                Activo (visible en el menú)
              </label>
            </div>

            {error && <p className="text-[10px] text-red-400">{error}</p>}

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-200 transition-all disabled:opacity-40 flex items-center gap-2"
              >
                {saving && <span className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin" />}
                {editingId ? 'Guardar cambios' : 'Crear enlace'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-6 py-2.5 border border-neutral-700 text-neutral-400 text-[10px] font-bold uppercase tracking-widest hover:text-white hover:border-white transition-all"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Link list */}
        <section>
          <h2 className="font-headline text-sm uppercase tracking-widest text-white mb-4">
            Estructura del menú
          </h2>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-5 h-5 border-2 border-neutral-700 border-t-white rounded-full animate-spin" />
            </div>
          ) : links.length === 0 ? (
            <div className="border border-neutral-800 py-12 text-center">
              <span className="material-symbols-outlined text-3xl text-neutral-700 mb-3 block" aria-hidden="true">link_off</span>
              <p className="text-[10px] uppercase tracking-widest text-neutral-600 font-bold">
                Sin enlaces. Crea el primero arriba.
              </p>
            </div>
          ) : (
            <div className="border border-neutral-800">
              {links.map(link => renderLinkRow(link, 0))}
            </div>
          )}
        </section>
      </main>

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <>
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} aria-hidden="true" />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-[#131313] border border-neutral-700 p-8 max-w-sm w-full space-y-4">
              <h3 className="font-headline text-sm uppercase tracking-widest text-white">Confirmar eliminación</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                ¿Eliminar <span className="text-white font-bold">"{deleteTarget.label}"</span>?
                {deleteTarget.children && deleteTarget.children.length > 0 && (
                  <span className="block mt-1 text-amber-400">
                    Este enlace tiene {deleteTarget.children.length} subenlace{deleteTarget.children.length !== 1 ? 's' : ''} que quedarán como raíz.
                  </span>
                )}
              </p>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={confirmDelete}
                  disabled={saving}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold uppercase tracking-widest transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  {saving && <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  Eliminar
                </button>
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 py-2.5 border border-neutral-700 text-neutral-400 text-[10px] font-bold uppercase tracking-widest hover:text-white hover:border-white transition-all"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
