'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'

interface FavCtx {
  ids: string[]
  count: number
  toggle: (id: string) => void
  isFav: (id: string) => boolean
  ready: boolean
}

const Ctx = createContext<FavCtx | null>(null)
const KEY = 'adonis_favorites'

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [ids, setIds] = useState<string[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const s = localStorage.getItem(KEY)
      if (s) setIds(JSON.parse(s))
    } catch {}
    setReady(true)
  }, [])

  const toggle = useCallback((id: string) => {
    setIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      localStorage.setItem(KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const isFav = useCallback((id: string) => ids.includes(id), [ids])

  return (
    <Ctx.Provider value={{ ids, count: ids.length, toggle, isFav, ready }}>
      {children}
    </Ctx.Provider>
  )
}

export function useFavorites() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useFavorites must be within FavoritesProvider')
  return ctx
}
