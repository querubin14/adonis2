'use client'

import { useState, useEffect, useCallback } from 'react'
import AdminSidebar from '@/components/AdminSidebar'
import {
  getCategories,
  insertCategory,
  updateCategory,
  deleteCategory,
  buildCategoryTree,
  flattenTree,
} from '@/lib/data'
import { Category } from '@/lib/types'

// ── Types ────────────────────────────────────────────────────────
interface Toast { message: string; type: 'success' | 'error' }

const EMPTY_FORM = { name: '', slug: '', description: '', parent_id: '', sort_order: '0' }

// ── Helpers ──────────────────────────────────────────────────────
function toSlug(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-').replace(/[^\w-]+/g, '')
}

const INDENT = ['', '↳ ', '  ↳ ', '    ↳ ']

// ── CategoryRow: one row in the tree ─────────────────────────────
function CategoryRow({
  cat,
  depth,
  onEdit,
  onDelete,
  onAddChild,
}: {
  cat: Category
  depth: number
  onEdit: (c: Category) => void
  onDelete: (c: Category) => void
  onAddChild: (parentId: string) => void
}) {
  const [open, setOpen] = useState(depth < 2)
  const hasChildren = (cat.children?.length ?? 0) > 0
  const indent = depth * 20

  return (
    <>
      <tr className="border-b border-outline-variant/5 hover:bg-surface-container transition-colors group">
        <td className="px-6 py-3" style={{ paddingLeft: `${24 + indent}px` }}>
          <div className="flex items-center gap-2">
            {hasChildren ? (
              <button
                onClick={() => setOpen(v => !v)}
                aria-label={open ? 'Colapsar' : 'Expandir'}
                className="w-5 h-5 flex items-center justify-center text-neutral-500 hover:text-white transition-colors flex-shrink-0"
              >
                <span className="material-symbols-outlined text-sm" aria-hidden="true">
                  {open ? 'expand_more' : 'chevron_right'}
                </span>
              </button>
            ) : (
              <span className="w-5 flex-shrink-0" />
            )}
            <span className={`font-headline text-sm ${depth === 0 ? 'text-white' : depth === 1 ? 'text-neutral-200' : 'text-neutral-400'}`}>
              {cat.name}
            </span>
            {depth === 0 && (
              <span className="text-[8px] uppercase tracking-widest text-neutral-600 font-bold bg-neutral-800 px-1.5 py-0.5 ml-1">
                raíz
              </span>
            )}
          </div>
        </td>
        <td className="px-6 py-3">
          <span className="text-xs text-neutral-500 font-mono">{cat.slug}</span>
        </td>
        <td className="px-6 py-3">
          <span className="text-xs text-neutral-500 truncate max-w-[200px] block">
            {cat.description ?? '—'}
          </span>
        </td>
        <td className="px-6 py-3">
          <span className="text-xs text-neutral-600 tabular-nums">{cat.sort_order ?? 0}</span>
        </td>
        <td className="px-6 py-3">
          <span className="text-xs text-neutral-600 tabular-nums">
            {cat.children?.length ?? 0}
          </span>
        </td>
        <td className="px-6 py-3">
          <div className="flex items-center gap-1">
            <button
              onClick={() => onAddChild(cat.id)}
              aria-label={`Agregar subcategoría en ${cat.name}`}
              title="Agregar hijo"
              className="p-2 text-neutral-500 hover:text-white hover:bg-neutral-800 transition-all"
            >
              <span className="material-symbols-outlined text-sm" aria-hidden="true">add</span>
            </button>
            <button
              onClick={() => onEdit(cat)}
              aria-label={`Editar ${cat.name}`}
              className="p-2 text-neutral-500 hover:text-white hover:bg-neutral-800 transition-all"
            >
              <span className="material-symbols-outlined text-sm" aria-hidden="true">edit</span>
            </button>
            <button
              onClick={() => onDelete(cat)}
              aria-label={`Eliminar ${cat.name}`}
              className="p-2 text-neutral-500 hover:text-error hover:bg-error/10 transition-all"
            >
              <span className="material-symbols-outlined text-sm" aria-hidden="true">delete</span>
            </button>
          </div>
        </td>
      </tr>
      {open && hasChildren && cat.children!.map(child => (
        <CategoryRow key={child.id} cat={child} depth={depth + 1} onEdit={onEdit} onDelete={onDelete} onAddChild={onAddChild} />
      ))}
    </>
  )
}

// ── Main Page ────────────────────────────────────────────────────
export default function CategoriesAdminPage() {
  const [allCategories, setAllCategories] = useState<Category[]>([])
  const [tree, setTree] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [editing, setEditing] = useState<Category | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)
  const [toast, setToast] = useState<Toast | null>(null)
  const [showForm, setShowForm] = useState(false)

  const load = useCallback(async () => {
    try {
      const cats = await getCategories()
      setAllCategories(cats)
      setTree(buildCategoryTree(cats))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(t)
  }, [toast])

  function showMsg(message: string, type: Toast['type']) {
    setToast({ message, type })
  }

  function openNew(prefillParentId?: string) {
    setEditing(null)
    setFormData({ ...EMPTY_FORM, parent_id: prefillParentId ?? '' })
    setShowForm(true)
    // Scroll to form
    setTimeout(() => document.getElementById('cat-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  function openEdit(cat: Category) {
    setEditing(cat)
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description ?? '',
      parent_id: cat.parent_id ?? '',
      sort_order: String(cat.sort_order ?? 0),
    })
    setShowForm(true)
  }

  function closeForm() {
    setEditing(null)
    setFormData(EMPTY_FORM)
    setShowForm(false)
  }

  function handleInput(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setFormData(prev => {
      const next = { ...prev, [name]: value }
      if (name === 'name' && !editing) next.slug = toSlug(value)
      return next
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const sortVal = parseInt(formData.sort_order) || 0
      const payload = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim() || null,
        // null = explicitly no parent (root); undefined would be ignored on UPDATE
        parent_id: formData.parent_id || null,
        // Only send sort_order if user explicitly set a non-zero value,
        // so it doesn't fail when the column hasn't been added yet.
        ...(sortVal > 0 ? { sort_order: sortVal } : {}),
      }

      if (editing) {
        await updateCategory(editing.id, payload)
        showMsg('Categoría actualizada.', 'success')
      } else {
        await insertCategory(payload)
        showMsg('Categoría creada.', 'success')
      }
      closeForm()
      await load()
    } catch (err: any) {
      showMsg('Error: ' + (err.message ?? 'Inténtelo nuevamente.'), 'error')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return
    try {
      await deleteCategory(deleteTarget.id)
      showMsg('Categoría eliminada.', 'success')
      setDeleteTarget(null)
      await load()
    } catch (err: any) {
      showMsg('Error: ' + (err.message ?? ''), 'error')
    }
  }

  // Flat list for parent <select>, excluding the category being edited and its descendants
  const selectableParents = flattenTree(tree).filter(c => {
    if (!editing) return true
    // Cannot set self or descendant as parent
    function isDescendant(node: Category, targetId: string): boolean {
      if (node.id === targetId) return true
      return (node.children ?? []).some(ch => isDescendant(ch, targetId))
    }
    return !isDescendant(editing, c.id)
  })

  const stats = {
    total: allCategories.length,
    roots: allCategories.filter(c => !c.parent_id).length,
    depth2: allCategories.filter(c => {
      if (!c.parent_id) return false
      const parent = allCategories.find(p => p.id === c.parent_id)
      return parent && !parent.parent_id
    }).length,
  }

  return (
    <div className="flex min-h-screen bg-background text-on-background font-body">

      {/* Toast */}
      {toast && (
        <div
          role="alert"
          aria-live="polite"
          className={`fixed top-5 right-5 z-[100] flex items-center gap-3 px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest shadow-xl ${
            toast.type === 'success' ? 'bg-white text-black' : 'bg-error text-on-error'
          }`}
        >
          <span className="material-symbols-outlined text-sm" aria-hidden="true">
            {toast.type === 'success' ? 'check_circle' : 'error'}
          </span>
          {toast.message}
        </div>
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="del-dialog-title"
        >
          <div className="bg-surface-container border border-outline-variant/20 p-10 max-w-sm w-full">
            <h3 id="del-dialog-title" className="font-headline text-white text-base uppercase tracking-widest mb-1">
              Eliminar Categoría
            </h3>
            <p className="text-neutral-300 text-sm font-medium mb-2">"{deleteTarget.name}"</p>
            {(deleteTarget.children?.length ?? 0) > 0 && (
              <p className="text-yellow-400 text-xs mb-3 flex items-start gap-2">
                <span className="material-symbols-outlined text-sm flex-shrink-0 mt-0.5" aria-hidden="true">warning</span>
                Esta categoría tiene {deleteTarget.children!.length} subcategoría(s). Se reasignarán al padre de esta.
              </p>
            )}
            <p className="text-neutral-400 text-xs leading-relaxed mb-8">
              Los productos asociados perderán su categoría. Esta acción es irreversible.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 bg-error text-on-error py-3 text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-opacity"
              >
                Eliminar
              </button>
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 border border-outline-variant/30 text-neutral-400 py-3 text-[10px] font-bold uppercase tracking-widest hover:text-white hover:border-white transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <AdminSidebar />

      <main className="ml-56 flex-grow flex flex-col min-h-screen">

        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-outline-variant/10 px-10 py-5 flex items-center justify-between">
          <div>
            <h2 className="font-headline text-base text-white uppercase tracking-[0.2em]">
              Categorías
            </h2>
            <p className="text-[9px] text-neutral-500 uppercase tracking-widest mt-0.5">
              {allCategories.length} categoría{allCategories.length !== 1 ? 's' : ''} — árbol jerárquico
            </p>
          </div>
          <button
            onClick={() => openNew()}
            className="flex items-center gap-2 bg-white text-black px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-200 transition-all"
          >
            <span className="material-symbols-outlined text-sm" aria-hidden="true">add</span>
            Nueva Categoría
          </button>
        </header>

        <div className="p-10 flex-grow">

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-10">
            {[
              { label: 'Total',          value: stats.total,  icon: 'category' },
              { label: 'Categorías Raíz', value: stats.roots,  icon: 'folder' },
              { label: 'Subcategorías',   value: stats.depth2, icon: 'folder_open' },
            ].map(s => (
              <div key={s.label} className="bg-surface-container-low border border-outline-variant/10 p-5 flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <span className="text-[8px] uppercase tracking-[0.35em] text-neutral-500 font-bold">{s.label}</span>
                  <span className="material-symbols-outlined text-sm text-neutral-700" aria-hidden="true">{s.icon}</span>
                </div>
                <p className="font-headline text-4xl leading-none text-white">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Form panel */}
          {showForm && (
            <div id="cat-form" className="mb-8 bg-surface-container-low border border-outline-variant/10 p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[9px] uppercase tracking-[0.35em] text-neutral-400 font-bold">
                  {editing ? `Editando: ${editing.name}` : 'Nueva Categoría'}
                </h3>
                <button
                  onClick={closeForm}
                  aria-label="Cerrar formulario"
                  className="p-1.5 text-neutral-500 hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined text-base" aria-hidden="true">close</span>
                </button>
              </div>

              <form onSubmit={handleSubmit} noValidate>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">

                  {/* Name */}
                  <div>
                    <label htmlFor="cat-name" className="block text-[9px] tracking-[0.25em] text-neutral-500 uppercase mb-2 font-bold">
                      Nombre <span className="text-error" aria-hidden="true">*</span>
                    </label>
                    <input
                      id="cat-name"
                      name="name"
                      value={formData.name}
                      onChange={handleInput}
                      required
                      autoComplete="off"
                      placeholder="Ej: Anillos de Gala"
                      className="w-full bg-transparent border-b border-neutral-800 text-white text-sm py-2.5 outline-none focus:border-white transition-colors placeholder:text-neutral-700"
                    />
                  </div>

                  {/* Slug */}
                  <div>
                    <label htmlFor="cat-slug" className="block text-[9px] tracking-[0.25em] text-neutral-500 uppercase mb-2 font-bold">
                      Slug (URL) <span className="text-error" aria-hidden="true">*</span>
                    </label>
                    <input
                      id="cat-slug"
                      name="slug"
                      value={formData.slug}
                      onChange={handleInput}
                      required
                      autoComplete="off"
                      placeholder="anillos-gala"
                      className="w-full bg-transparent border-b border-neutral-800 text-neutral-400 text-xs py-2.5 outline-none focus:border-white transition-colors placeholder:text-neutral-700"
                    />
                  </div>

                  {/* Parent */}
                  <div>
                    <label htmlFor="cat-parent" className="block text-[9px] tracking-[0.25em] text-neutral-500 uppercase mb-2 font-bold">
                      Categoría Padre
                    </label>
                    <select
                      id="cat-parent"
                      name="parent_id"
                      value={formData.parent_id}
                      onChange={handleInput}
                      className="w-full bg-surface-container border-b border-neutral-800 text-white text-sm py-2.5 outline-none focus:border-white transition-colors"
                    >
                      <option value="" className="bg-neutral-900">— Sin padre (raíz) —</option>
                      {selectableParents.map(c => (
                        <option key={c.id} value={c.id} className="bg-neutral-900">
                          {INDENT[Math.min(c.depth ?? 0, 3)]}{c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <label htmlFor="cat-desc" className="block text-[9px] tracking-[0.25em] text-neutral-500 uppercase mb-2 font-bold">
                      Descripción
                    </label>
                    <input
                      id="cat-desc"
                      name="description"
                      value={formData.description}
                      onChange={handleInput}
                      autoComplete="off"
                      placeholder="Descripción breve de la categoría..."
                      className="w-full bg-transparent border-b border-neutral-800 text-white text-sm py-2.5 outline-none focus:border-white transition-colors placeholder:text-neutral-700"
                    />
                  </div>

                  {/* Sort order — only shown after SQL migration adds the column */}
                  <div>
                    <label htmlFor="cat-sort" className="block text-[9px] tracking-[0.25em] text-neutral-500 uppercase mb-2 font-bold">
                      Orden de visualización
                    </label>
                    <input
                      id="cat-sort"
                      name="sort_order"
                      type="number"
                      min="0"
                      value={formData.sort_order}
                      onChange={handleInput}
                      placeholder="0"
                      className="w-full bg-transparent border-b border-neutral-800 text-white text-sm py-2.5 outline-none focus:border-white transition-colors placeholder:text-neutral-700"
                    />
                    <p className="text-[8px] text-neutral-600 mt-1">Menor número = aparece primero</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-white text-black px-10 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {submitting && (
                      <span className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" aria-hidden="true" />
                    )}
                    {submitting ? 'Guardando...' : editing ? 'Actualizar' : 'Crear Categoría'}
                  </button>
                  <button
                    type="button"
                    onClick={closeForm}
                    className="px-8 py-3 border border-outline-variant/30 text-neutral-400 text-[10px] font-bold uppercase tracking-widest hover:text-white hover:border-white transition-all"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Tree Table */}
          <div className="bg-surface-container-low border border-outline-variant/10">
            <div className="border-b border-outline-variant/10 px-6 py-4 flex items-center justify-between">
              <h3 className="text-[9px] uppercase tracking-[0.35em] text-neutral-400 font-bold">
                Árbol de Categorías
              </h3>
              <div className="flex items-center gap-1.5 text-[8px] uppercase tracking-widest text-neutral-600 font-bold">
                <span className="material-symbols-outlined text-xs" aria-hidden="true">info</span>
                Haz clic en ▶ para expandir
              </div>
            </div>

            {loading ? (
              <div className="py-20 flex justify-center">
                <div className="w-6 h-6 border-2 border-neutral-700 border-t-white rounded-full animate-spin" aria-label="Cargando..." />
              </div>
            ) : tree.length === 0 ? (
              <div className="py-24 flex flex-col items-center gap-4">
                <span className="material-symbols-outlined text-5xl text-neutral-800" aria-hidden="true">account_tree</span>
                <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">Sin categorías creadas</p>
                <button onClick={() => openNew()} className="mt-2 text-[10px] text-white underline underline-offset-4 hover:text-neutral-300 transition-colors font-bold uppercase tracking-widest">
                  Crear primera categoría
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full" aria-label="Árbol de categorías">
                  <thead>
                    <tr className="border-b border-outline-variant/10">
                      {['Nombre', 'Slug', 'Descripción', 'Orden', 'Hijos', 'Acciones'].map(h => (
                        <th key={h} scope="col" className="px-6 py-3 text-left text-[8px] uppercase tracking-[0.35em] text-neutral-500 font-bold whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tree.map(cat => (
                      <CategoryRow
                        key={cat.id}
                        cat={cat}
                        depth={0}
                        onEdit={openEdit}
                        onDelete={setDeleteTarget}
                        onAddChild={openNew}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="mt-6 flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-[8px] uppercase tracking-[0.3em] text-neutral-600 font-bold bg-neutral-800 px-1.5 py-0.5">raíz</span>
              <span className="text-[9px] text-neutral-600">Categoría sin padre</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-neutral-400 text-xs">↳</span>
              <span className="text-[9px] text-neutral-600">Subcategoría (nivel 2)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-neutral-500 text-xs pl-4">↳</span>
              <span className="text-[9px] text-neutral-600">Sub-subcategoría (nivel 3+)</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
