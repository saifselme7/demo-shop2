'use client'

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from 'react'
import type { CartItem } from '@/types/database'

const CART_STORAGE_KEY = 'saifstore_cart_v1'

interface CartContextValue {
  items: CartItem[]
  itemCount: number
  subtotal: number
  isLoaded: boolean
  addItem: (item: CartItem) => void
  updateQuantity: (productId: string, quantity: number) => void
  removeItem: (productId: string) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextValue | undefined>(undefined)

function readCart(): CartItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setItems(readCart())
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (!isLoaded) return
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
    } catch {
      /* ignore storage errors */
    }
  }, [items, isLoaded])

  const addItem = useCallback((item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((p) => p.product_id === item.product_id)
      if (existing) {
        return prev.map((p) =>
          p.product_id === item.product_id
            ? {
                ...p,
                quantity: Math.min(
                  Math.max(p.quantity + item.quantity, 1),
                  p.stock && p.stock > 0 ? p.stock : p.quantity + item.quantity
                ),
              }
            : p
        )
      }
      return [...prev, item]
    })
  }, [])

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setItems((prev) =>
      prev
        .map((p) => {
          if (p.product_id !== productId) return p
          const max = p.stock && p.stock > 0 ? p.stock : 999
          return { ...p, quantity: Math.max(1, Math.min(quantity, max)) }
        })
        .filter((p) => p.quantity > 0)
    )
  }, [])

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((p) => p.product_id !== productId))
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const value = useMemo<CartContextValue>(() => {
    const itemCount = items.reduce((sum, p) => sum + p.quantity, 0)
    const subtotal = items.reduce((sum, p) => sum + p.price * p.quantity, 0)
    return {
      items,
      itemCount,
      subtotal,
      isLoaded,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    }
  }, [items, isLoaded, addItem, updateQuantity, removeItem, clearCart])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within a CartProvider')
  return ctx
}
