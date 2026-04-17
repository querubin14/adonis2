'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { Product } from '@/lib/types'

export interface CartItem { product: Product; quantity: number }

interface CartCtx {
  items: CartItem[]
  count: number
  total: number
  isOpen: boolean
  add: (p: Product) => void
  remove: (id: string) => void
  update: (id: string, qty: number) => void
  clear: () => void
  open: () => void
  close: () => void
}

const Ctx = createContext<CartCtx | null>(null)
const KEY = 'adonis_cart'

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    try {
      const s = localStorage.getItem(KEY)
      if (s) setItems(JSON.parse(s))
    } catch {}
  }, [])

  const persist = useCallback((next: CartItem[]) => {
    localStorage.setItem(KEY, JSON.stringify(next))
    return next
  }, [])

  const add = useCallback((p: Product) => {
    setItems(prev => {
      const ex = prev.find(i => i.product.id === p.id)
      return persist(
        ex
          ? prev.map(i => i.product.id === p.id ? { ...i, quantity: i.quantity + 1 } : i)
          : [...prev, { product: p, quantity: 1 }]
      )
    })
  }, [persist])

  const remove = useCallback((id: string) => {
    setItems(prev => persist(prev.filter(i => i.product.id !== id)))
  }, [persist])

  const update = useCallback((id: string, qty: number) => {
    if (qty < 1) { remove(id); return }
    setItems(prev => persist(prev.map(i => i.product.id === id ? { ...i, quantity: qty } : i)))
  }, [persist, remove])

  const clear = useCallback(() => {
    setItems([])
    localStorage.removeItem(KEY)
  }, [])

  const count = items.reduce((s, i) => s + i.quantity, 0)
  const total = items.reduce((s, i) => s + i.product.price * i.quantity, 0)

  return (
    <Ctx.Provider value={{ items, count, total, isOpen, add, remove, update, clear, open: () => setIsOpen(true), close: () => setIsOpen(false) }}>
      {children}
    </Ctx.Provider>
  )
}

export function useCart() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useCart must be within CartProvider')
  return ctx
}
