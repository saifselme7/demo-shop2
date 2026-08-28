'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/context/CartContext'
import { formatPrice } from '@/lib/utils'
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, PackageSearch } from 'lucide-react'

const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=300&q=80'

export default function CartPage() {
  const { items, itemCount, subtotal, updateQuantity, removeItem, clearCart, isLoaded } = useCart()

  if (!isLoaded) {
    return (
      <div className="container-x py-20 flex justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-line border-t-foreground animate-spin" />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="container-x py-24 flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-full bg-neutral-100 flex items-center justify-center mb-6">
          <ShoppingBag className="w-9 h-9 text-muted" />
        </div>
        <h1 className="text-2xl font-black">سلتك فارغة</h1>
        <p className="text-muted mt-2 max-w-sm">
          لم تُضف أي منتجات بعد. ابدأ التسوق واكتشف أحدث تشكيلاتنا.
        </p>
        <Link
          href="/products"
          className="btn-press inline-flex items-center gap-2 px-6 py-3 rounded-full bg-foreground text-background text-sm font-bold mt-6 hover:bg-neutral-800"
        >
          تسوّق الآن
          <ArrowLeft className="w-4 h-4" />
        </Link>
      </div>
    )
  }

  return (
    <div className="container-x py-10 sm:py-14">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black tracking-tight">سلة التسوق</h1>
        <span className="text-sm text-muted">{itemCount} منتج</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const max = item.stock && item.stock > 0 ? item.stock : 99
            return (
              <div
                key={item.product_id}
                className="flex gap-4 bg-background rounded-3xl border border-line shadow-card p-4"
              >
                <Link
                  href={`/products/${item.slug}`}
                  className="relative w-24 h-28 shrink-0 rounded-2xl overflow-hidden bg-neutral-100"
                >
                  <Image
                    src={item.image_url || FALLBACK_IMG}
                    alt={item.name}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </Link>
                <div className="flex-1 min-w-0 flex flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <Link href={`/products/${item.slug}`} className="font-bold hover:underline">
                        {item.name}
                      </Link>
                      <p className="text-sm font-black mt-1">{formatPrice(item.price)}</p>
                    </div>
                    <button
                      onClick={() => removeItem(item.product_id)}
                      className="p-2 text-muted hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                      aria-label="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-3">
                    <div className="flex items-center rounded-full border border-line overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                        className="p-2 text-muted hover:bg-neutral-100"
                        aria-label="إنقاص"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-9 text-center font-bold text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                        disabled={item.quantity >= max}
                        className="p-2 text-muted hover:bg-neutral-100 disabled:opacity-40"
                        aria-label="زيادة"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="font-black">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                </div>
              </div>
            )
          })}

          <button
            onClick={clearCart}
            className="inline-flex items-center gap-2 text-xs text-muted hover:text-red-600 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            إفراغ السلة
          </button>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-background rounded-3xl border border-line shadow-card p-6 space-y-5 sticky top-24">
            <h2 className="text-lg font-black">ملخص الطلب</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-muted">
                <span>المجموع الفرعي</span>
                <span className="text-foreground font-semibold">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>التوصيل</span>
                <span className="text-foreground font-semibold">يُحسب عند الدفع</span>
              </div>
            </div>
            <div className="border-t border-line pt-4 flex justify-between items-center">
              <span className="font-bold">الإجمالي</span>
              <span className="text-2xl font-black">{formatPrice(subtotal)}</span>
            </div>
            <Link
              href="/checkout"
              className="btn-press w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-foreground text-background font-bold text-sm hover:bg-neutral-800"
            >
              إتمام الطلب
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <Link
              href="/products"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-line text-sm font-semibold text-muted hover:text-foreground hover:bg-neutral-50 transition-colors"
            >
              <PackageSearch className="w-4 h-4" />
              متابعة التسوق
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
