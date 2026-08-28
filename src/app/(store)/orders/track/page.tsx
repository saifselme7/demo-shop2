'use client'

import React, { Suspense, useEffect, useState } from 'react'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { formatPrice, formatDate } from '@/lib/utils'
import type { Order, OrderItem, PaymentStatus, OrderStatus } from '@/types/database'
import { Search, Loader2, AlertCircle, PackageSearch, Truck } from 'lucide-react'

const PAYMENT_LABEL: Record<string, string> = {
  vodafone_cash: 'فودافون كاش',
  instapay: 'انستاباي',
}

const PAYMENT_STATUS: Record<PaymentStatus, { label: string; cls: string }> = {
  pending: { label: 'بانتظار المراجعة', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  approved: { label: 'تم تأكيد الدفع', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  rejected: { label: 'تم رفض الدفع', cls: 'bg-red-50 text-red-700 border-red-200' },
}

const ORDER_STEPS: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'shipped', 'delivered']

const ORDER_STATUS_LABEL: Record<string, string> = {
  pending: 'قيد المراجعة',
  confirmed: 'تم التأكيد',
  preparing: 'جارٍ التجهيز',
  shipped: 'تم الشحن',
  delivered: 'تم التسليم',
  cancelled: 'ملغي',
}

function TrackContent() {
  const searchParams = useSearchParams()
  const supabase = createClient()

  const [orderNumber, setOrderNumber] = useState(searchParams.get('order') || '')
  const [phone, setPhone] = useState('')
  const [result, setResult] = useState<{ order: Order; items: OrderItem[] } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const pre = searchParams.get('order')
    if (pre) setOrderNumber(pre)
  }, [searchParams])

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    setResult(null)
    try {
      const { data, error: rpcError } = await supabase.rpc('get_order_by_number', {
        p_order_number: orderNumber.trim(),
        p_phone: phone.trim(),
      })
      if (rpcError) throw rpcError
      const parsed = data as unknown as { order: Order; items: OrderItem[] }
      setResult(parsed)
    } catch (err: any) {
      setError(err.message || 'تعذر العثور على الطلب. تأكد من رقم الطلب ورقم الموبايل.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container-x py-10 sm:py-16 max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-neutral-100 mb-2">
          <PackageSearch className="w-7 h-7 text-muted" />
        </div>
        <h1 className="text-3xl font-black tracking-tight">تتبع طلبك</h1>
        <p className="text-muted text-sm">
          أدخل رقم الطلب ورقم الموبايل المسجّل به لمتابعة حالة طلبك.
        </p>
      </div>

      <form onSubmit={handleTrack} className="bg-background rounded-3xl border border-line shadow-card p-6 space-y-4">
        <div className="space-y-1.5">
          <label className="block text-sm font-bold">رقم الطلب</label>
          <input
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            className="input"
            dir="ltr"
            placeholder="ORD-XXXXXX-XXXXXX"
            required
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-bold">رقم الموبايل</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="input"
            dir="ltr"
            placeholder="01xxxxxxxxx"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="btn-press w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-foreground text-background font-bold text-sm hover:bg-neutral-800 disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
          تتبّع الطلب
        </button>
      </form>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div className="bg-background rounded-3xl border border-line shadow-card overflow-hidden">
          <div className="p-6 border-b border-line flex items-center justify-between">
            <div>
              <p className="text-xs text-muted">رقم الطلب</p>
              <p className="text-xl font-black" dir="ltr">{result.order.order_number}</p>
            </div>
            <div className="text-left">
              <p className="text-xs text-muted">الإجمالي</p>
              <p className="text-xl font-black">{formatPrice(result.order.total)}</p>
            </div>
          </div>

          {/* Order status */}
          {result.order.status === 'cancelled' ? (
            <div className="p-6">
              <span className="px-3 py-1.5 rounded-full bg-red-50 text-red-700 border border-red-200 text-xs font-bold">
                الطلب ملغي
              </span>
            </div>
          ) : (
            <div className="p-6">
              <div className="flex items-center justify-between">
                {ORDER_STEPS.map((step, i) => {
                  const currentIdx = ORDER_STEPS.indexOf(result.order.status)
                  const done = i < currentIdx
                  const active = i === currentIdx
                  return (
                    <div key={step} className="flex-1 text-center relative">
                      <div
                        className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center border-2 text-xs font-bold ${
                          done
                            ? 'bg-foreground border-foreground text-background'
                            : active
                              ? 'border-foreground text-foreground'
                              : 'border-neutral-200 text-neutral-300'
                        }`}
                      >
                        {done ? '✓' : i + 1}
                      </div>
                      <p className={`text-[11px] mt-1.5 ${done || active ? 'text-foreground font-bold' : 'text-muted'}`}>
                        {ORDER_STATUS_LABEL[step]}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Payment status */}
          <div className="p-6 border-t border-line">
            <h3 className="font-bold mb-3">حالة الدفع</h3>
            <div className="flex flex-wrap items-center gap-3">
              <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${PAYMENT_STATUS[result.order.payment_status].cls}`}>
                {PAYMENT_STATUS[result.order.payment_status].label}
              </span>
              {result.order.payment_method && (
                <span className="text-sm text-muted">
                  طريقة الدفع: {PAYMENT_LABEL[result.order.payment_method]}
                </span>
              )}
            </div>
            {result.order.payment_status === 'rejected' && result.order.payment_rejection_reason && (
              <p className="text-sm text-red-600 mt-3">
                سبب الرفض: {result.order.payment_rejection_reason}
              </p>
            )}
            {result.order.payment_status === 'rejected' && (
              <p className="text-sm text-muted mt-2">
                تواصل معنا عبر واتساب لإعادة إتمام الطلب أو توضيح سبب الرفض.
              </p>
            )}
          </div>

          {/* Items */}
          <div className="p-6 border-t border-line space-y-3">
            <h3 className="font-bold">المنتجات</h3>
            {result.items.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="relative w-14 h-16 rounded-xl overflow-hidden bg-neutral-100">
                  {item.product_image && (
                    <Image src={item.product_image} alt={item.product_name} fill sizes="56px" className="object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{item.product_name}</p>
                  <p className="text-xs text-muted">× {item.quantity}</p>
                </div>
                <span className="text-sm font-bold">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          {/* Delivery info */}
          <div className="p-6 border-t border-line text-sm space-y-2">
            <h3 className="font-bold">معلومات التوصيل</h3>
            <p className="flex items-center gap-2 text-muted">
              <Truck className="w-4 h-4" /> {result.order.shipping_address}
            </p>
            <p className="text-muted">الاسم: {result.order.customer_name}</p>
            <p className="text-muted" dir="ltr">الهاتف: {result.order.customer_phone}</p>
            <p className="text-xs text-muted">تاريخ الطلب: {formatDate(result.order.created_at)}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default function TrackOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="container-x py-24 flex justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-line border-t-foreground animate-spin" />
        </div>
      }
    >
      <TrackContent />
    </Suspense>
  )
}
