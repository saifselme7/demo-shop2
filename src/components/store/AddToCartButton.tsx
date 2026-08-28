'use client'

import React, { useState } from 'react'
import { useCart } from '@/context/CartContext'
import { ShoppingBag, Check, Loader2 } from 'lucide-react'
import type { CartItem } from '@/types/database'
import { cn } from '@/lib/utils'

interface AddToCartButtonProps {
  item: CartItem
  className?: string
  label?: string
  fullWidth?: boolean
}

export function AddToCartButton({
  item,
  className,
  label = 'أضف إلى السلة',
  fullWidth = false,
}: AddToCartButtonProps) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleAdd = () => {
    setLoading(true)
    // Simulate a tiny bit of processing so the loading state is visible
    setTimeout(() => {
      addItem(item)
      setLoading(false)
      setAdded(true)
      setTimeout(() => setAdded(false), 1600)
    }, 250)
  }

  const disabled = item.stock !== null && item.stock <= 0

  return (
    <button
      type="button"
      onClick={handleAdd}
      disabled={disabled || loading}
      className={cn(
        'btn-press inline-flex items-center justify-center gap-2 rounded-full font-bold text-sm',
        fullWidth ? 'w-full' : 'w-auto',
        disabled
          ? 'cursor-not-allowed bg-neutral-200 text-neutral-400'
          : added
            ? 'bg-emerald-600 text-white shadow-md'
            : 'bg-foreground text-background hover:bg-neutral-800',
        className
      )}
      aria-label={disabled ? 'غير متوفر' : label}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : added ? (
        <Check className="w-4 h-4" />
      ) : (
        <ShoppingBag className="w-4 h-4" />
      )}
      <span>{disabled ? 'نفدت الكمية' : added ? 'تمت الإضافة ✓' : label}</span>
    </button>
  )
}
