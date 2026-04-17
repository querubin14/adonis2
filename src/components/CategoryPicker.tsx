'use client'

import { useMemo, useState, useEffect } from 'react'
import { Category } from '@/lib/types'
import { buildCategoryTree } from '@/lib/data'

const LEVEL_LABELS = ['Principal', 'Categoría', 'Subcategoría', 'División']

function findPath(nodes: Category[], targetId: string, path: string[] = []): string[] | null {
  for (const n of nodes) {
    const p = [...path, n.id]
    if (n.id === targetId) return p
    const found = findPath(n.children ?? [], targetId, p)
    if (found) return found
  }
  return null
}

function findNode(nodes: Category[], id: string): Category | null {
  for (const n of nodes) {
    if (n.id === id) return n
    const found = findNode(n.children ?? [], id)
    if (found) return found
  }
  return null
}

export default function CategoryPicker({
  value,
  onChange,
  categories,
}: {
  value: string
  onChange: (id: string) => void
  categories: Category[]
}) {
  const tree = useMemo(() => buildCategoryTree(categories), [categories])

  const [selectedAt, setSelectedAt] = useState<string[]>(() =>
    value ? (findPath(tree, value) ?? []) : []
  )

  // Sync when external value changes (opening edit form)
  useEffect(() => {
    setSelectedAt(value ? (findPath(tree, value) ?? []) : [])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  function getChildren(depth: number): Category[] {
    if (depth === 0) return tree
    const parentId = selectedAt[depth - 1]
    if (!parentId) return []
    return findNode(tree, parentId)?.children ?? []
  }

  function handleSelect(depth: number, id: string) {
    setSelectedAt([...selectedAt.slice(0, depth), id])
    onChange(id)
  }

  function clear() {
    setSelectedAt([])
    onChange('')
  }

  // Compute which depth rows to show
  const levels: number[] = []
  for (let d = 0; ; d++) {
    const nodes = getChildren(d)
    if (nodes.length === 0) break
    levels.push(d)
    if (!selectedAt[d]) break
    if ((findNode(tree, selectedAt[d])?.children?.length ?? 0) === 0) break
  }

  const selectionLabel = selectedAt
    .map(id => categories.find(c => c.id === id)?.name ?? '')
    .filter(Boolean)
    .join(' → ')

  return (
    <div className="border border-neutral-800 p-4 space-y-4">
      {levels.map(depth => (
        <div key={depth}>
          <p className="text-[8px] uppercase tracking-[0.35em] text-neutral-600 font-bold mb-2.5">
            {LEVEL_LABELS[depth] ?? `Nivel ${depth + 1}`}
          </p>
          <div className="flex flex-wrap gap-2">
            {getChildren(depth).map(node => {
              const isSelected = selectedAt[depth] === node.id
              return (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => handleSelect(depth, node.id)}
                  className={`px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest transition-all ${
                    isSelected
                      ? 'bg-white text-black'
                      : 'border border-neutral-700 text-neutral-400 hover:text-white hover:border-white'
                  }`}
                >
                  {node.name}
                </button>
              )
            })}
          </div>
        </div>
      ))}

      <div className="pt-1 border-t border-neutral-800/60 flex items-center gap-2 min-h-[24px]">
        {value ? (
          <>
            <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider flex-shrink-0">
              Seleccionado:
            </span>
            <span className="text-[9px] text-white font-bold bg-neutral-800 px-2.5 py-1 flex items-center gap-2">
              {selectionLabel}
              <button
                type="button"
                onClick={clear}
                aria-label="Limpiar selección"
                className="text-neutral-400 hover:text-white text-sm leading-none"
              >
                ×
              </button>
            </span>
          </>
        ) : (
          <span className="text-[8px] text-neutral-700 italic">Ninguna categoría seleccionada</span>
        )}
      </div>
    </div>
  )
}
