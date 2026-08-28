'use client'

import React, { useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import type { CartItem } from '@/types/database'
import { cn } from '@/lib/utils'

interface ProductPurchaseBoxProps {
  item: CartItem
}

export function ProductPurchaseBox({ item }: ProductPurchaseBoxProps) {
  const { addItem } = useCart()
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  const out = item.stock !== null && item.stock <= 0
  const max = item.stock && item.stock > 0 ? item.stock : 99

  const handleAdd = () => {
    addItem({ ...item, quantity: qty })
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <span className="text-sm font-semibold text-muted">الكمية</span>
        <div className="flex items-center rounded-full border border-line overflow-hidden">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="p-2.5 text-muted hover:bg-neutral-100 transition-colors"
            aria-label="إنقاص"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-10 text-center font-bold">{qty}</span>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(max, q + 1))}
            className="p-2.5 text-muted hover:bg-neutral-100 transition-colors"
            aria-label="زيادة"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        {item.stock != null && item.stock > 0 && (
          <span className="text-xs text-muted">متاح: {item.stock} قطعة</span>
        )}
      </div>

      <button
        type="button"
        onClick={handleAdd}
        disabled={out}
        className={cn(
          'btn-press w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold text-sm transition-colors',
          out
            ? 'cursor-not-allowed bg-neutral-200 text-neutral-400'
            : added
              ? 'bg-emerald-600 text-white'
              : 'bg-foreground text-background hover:bg-neutral-800'
        )}
      >
        {out ? 'نفدت الكمية' : added ? 'تمت الإضافة ✓' : 'أضف إلى السلة'}
      </button>

      {out && (
        <p className="text-xs text-red-600 font-medium">عذراً، هذا المنتج غير متوفر حالياً.</p>
      )}
    </div>
  )
}
