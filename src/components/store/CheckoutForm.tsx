'use client'

import React, { useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useCart } from '@/context/CartContext'
import { formatPrice } from '@/lib/utils'
import type { CartItem, PaymentMethod } from '@/types/database'
import {
  UploadCloud,
  Loader2,
  Check,
  AlertCircle,
  ImagePlus,
  ArrowLeft,
  PartyPopper,
} from 'lucide-react'

interface CheckoutFormProps {
  paymentNumber: string
  vodafoneNumber: string
  instapayNumber: string
  deliveryFee: number
}

interface PaymentMethodDef {
  id: PaymentMethod
  label: string
  sublabel: string
  number: string
}

export function CheckoutForm({
  paymentNumber,
  vodafoneNumber,
  instapayNumber,
  deliveryFee,
}: CheckoutFormProps) {
  const supabase = createClient()
  const router = useRouter()
  const { items, subtotal, clearCart, isLoaded } = useCart()

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('vodafone_cash')
  const [transferNumber, setTransferNumber] = useState('')
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [proofPreview, setProofPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successOrder, setSuccessOrder] = useState<string | null>(null)

  const methods: PaymentMethodDef[] = [
    { id: 'vodafone_cash', label: 'فودافون كاش', sublabel: 'حوّل على محفظة فودافون', number: vodafoneNumber },
    { id: 'instapay', label: 'انستاباي', sublabel: 'حوّل عبر تطبيق انستاباي', number: instapayNumber },
  ]

  const selectedMethod = methods.find((m) => m.id === paymentMethod)!

  const total = useMemo(() => subtotal + deliveryFee, [subtotal, deliveryFee])

  if (!isLoaded) {
    return (
      <div className="container-x py-24 flex justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-line border-t-foreground animate-spin" />
      </div>
    )
  }

  if (items.length === 0 && !successOrder) {
    return (
      <div className="container-x py-24 flex flex-col items-center text-center">
        <h1 className="text-2xl font-black">سلتك فارغة</h1>
        <p className="text-muted mt-2">أضف منتجات قبل إتمام الطلب.</p>
        <Link
          href="/products"
          className="btn-press inline-flex items-center gap-2 px-6 py-3 rounded-full bg-foreground text-background text-sm font-bold mt-6"
        >
          تسوّق الآن
        </Link>
      </div>
    )
  }

  // Success screen
  if (successOrder) {
    return (
      <div className="container-x py-24 flex flex-col items-center text-center max-w-xl mx-auto">
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-6">
          <PartyPopper className="w-9 h-9 text-emerald-600" />
        </div>
        <h1 className="text-3xl font-black">تم استلام طلبك! 🎉</h1>
        <p className="text-muted mt-3 leading-relaxed">
          تم إنشاء طلبك بنجاح. حالتك الآن <b>بانتظار مراجعة الدفع</b> من الإدارة.
          احفظ رقم الطلب لتتبع حالته.
        </p>
        <div className="mt-6 w-full bg-background rounded-3xl border border-line shadow-card p-6">
          <p className="text-xs text-muted">رقم الطلب</p>
          <p className="text-3xl font-black tracking-wider mt-1" dir="ltr">
            {successOrder}
          </p>
          <Link
            href={`/orders/track?order=${successOrder}`}
            className="btn-press mt-5 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-foreground text-background text-sm font-bold"
          >
            تتبع طلبك
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
        <Link
          href="/products"
          className="text-sm font-semibold text-muted hover:text-foreground mt-6"
        >
          متابعة التسوق
        </Link>
      </div>
    )
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setProofFile(file)
    setProofPreview(URL.createObjectURL(file))
    setError(null)
  }

  const uploadProof = async (): Promise<string> => {
    if (!proofFile) return ''
    const ext = proofFile.name.split('.').pop() || 'jpg'
    const path = `proofs/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`
    const { error: upErr } = await supabase.storage
      .from('payment-proofs')
      .upload(path, proofFile, { cacheControl: '3600', upsert: false })
    if (upErr) {
      throw new Error(
        `فشل رفع صورة التحويل: ${upErr.message || 'تحقق من توفر البوكيت "payment-proofs"'}`
      )
    }
    return path
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) return setError('من فضلك أدخل الاسم.')
    if (phone.trim().length < 6) return setError('من فضلك أدخل رقم موبايل صحيح.')
    if (!address.trim()) return setError('من فضلك أدخل عنوان التوصيل.')
    if (!transferNumber.trim()) return setError('اكتب رقم الموبايل اللي تم التحويل منه.')
    if (!proofFile) return setError('ارفع صورة التحويل (سكرين شوت) قبل إتمام الطلب.')

    setSubmitting(true)
    try {
      // 1. Upload proof
      setUploading(true)
      const proofPath = await uploadProof()
      setUploading(false)

      // 2. Create order via secure RPC
      const payload = items.map((it: CartItem) => ({
        product_id: it.product_id,
        quantity: it.quantity,
      }))

      const { data, error: rpcError } = await supabase.rpc('create_order', {
        p_customer_name: name.trim(),
        p_customer_phone: phone.trim(),
        p_customer_email: email.trim() || null,
        p_shipping_address: address.trim(),
        p_notes: notes.trim() || null,
        p_payment_method: paymentMethod,
        p_payment_transfer_number: transferNumber.trim(),
        p_payment_proof_path: proofPath || null,
        p_items: payload,
      })

      if (rpcError) throw rpcError

      const result = data as unknown as { order_number: string }
      clearCart()
      setSuccessOrder(result.order_number)
    } catch (err: any) {
      console.error('Checkout error:', err)
      setError(
        err.message ||
          'حدث خطأ أثناء إتمام الطلب. تأكد من بياناتك وحاول مرة أخرى.'
      )
    } finally {
      setUploading(false)
      setSubmitting(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Customer info */}
        <section className="bg-background rounded-3xl border border-line shadow-card p-6 space-y-4">
          <h2 className="text-lg font-black">بيانات العميل</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="الاسم">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
                placeholder="مثال: أحمد محمد"
                required
              />
            </Field>
            <Field label="رقم الموبايل">
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input"
                dir="ltr"
                placeholder="01xxxxxxxxx"
                required
              />
            </Field>
          </div>
          <Field label="البريد الإلكتروني (اختياري)">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              dir="ltr"
              placeholder="example@mail.com"
            />
          </Field>
          <Field label="عنوان التوصيل">
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="input min-h-[80px]"
              placeholder="المحافظة، المدينة، العنوان بالتفصيل..."
              required
            />
          </Field>
          <Field label="ملاحظات (اختياري)">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input min-h-[60px]"
              placeholder="أي ملاحظات خاصة بالطلب"
            />
          </Field>
        </section>

        {/* Payment method */}
        <section className="bg-background rounded-3xl border border-line shadow-card p-6 space-y-4">
          <h2 className="text-lg font-black">طريقة الدفع</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {methods.map((m) => {
              const active = paymentMethod === m.id
              return (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => setPaymentMethod(m.id)}
                  className={`text-right p-4 rounded-2xl border-2 transition-all ${
                    active
                      ? 'border-foreground bg-neutral-50 shadow-sm'
                      : 'border-line hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold">{m.label}</span>
                    <span
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        active ? 'border-foreground' : 'border-neutral-300'
                      }`}
                    >
                      {active && <span className="w-2.5 h-2.5 rounded-full bg-foreground" />}
                    </span>
                  </div>
                  <p className="text-xs text-muted mt-1">{m.sublabel}</p>
                </button>
              )
            })}
          </div>

          {/* Payment instructions */}
          <div className="rounded-2xl bg-neutral-50 border border-line p-5 space-y-3">
            <h3 className="font-bold text-sm">كيفية الدفع</h3>
            <ol className="list-decimal pr-5 space-y-2 text-sm text-neutral-700">
              <li>حوّل قيمة الطلب ({formatPrice(total)}) على الرقم التالي:</li>
            </ol>
            <div className="flex flex-wrap items-center gap-3 justify-between bg-background rounded-xl border border-line px-4 py-3">
              <div>
                <p className="text-xs text-muted">{selectedMethod.label}</p>
                <p className="text-xl font-black tracking-wider" dir="ltr">
                  {selectedMethod.number}
                </p>
              </div>
              <span className="text-xs text-muted">أو الرقم الموحّد: <b dir="ltr">{paymentNumber}</b></span>
            </div>
            <ol className="list-decimal pr-5 space-y-2 text-sm text-neutral-700" start={2}>
              <li>اكتب رقم الموبايل اللي تم التحويل منه في الحقل أدناه.</li>
              <li>ارفع صورة التحويل (سكرين شوت) كإثبات.</li>
              <li>اضغط «إتمام الطلب» وسيقوم فريقنا بمراجعة الدفع.</li>
            </ol>
          </div>

          <Field label="رقم الموبايل اللي تم التحويل منه">
            <input
              value={transferNumber}
              onChange={(e) => setTransferNumber(e.target.value)}
              className="input"
              dir="ltr"
              placeholder="01xxxxxxxxx"
              required
            />
          </Field>

          {/* Proof upload */}
          <div className="space-y-2">
            <span className="block text-sm font-bold">صورة التحويل (إثبات الدفع)</span>
            {proofPreview ? (
              <div className="relative aspect-video max-h-72 rounded-2xl overflow-hidden bg-neutral-100 border border-line">
                <Image src={proofPreview} alt="إثبات الدفع" fill className="object-contain" />
                <button
                  type="button"
                  onClick={() => {
                    setProofFile(null)
                    setProofPreview(null)
                  }}
                  className="absolute top-2 left-2 px-3 py-1.5 rounded-full bg-black/70 text-white text-xs font-semibold hover:bg-black"
                >
                  إزالة
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex flex-col items-center justify-center gap-2 p-8 rounded-2xl border-2 border-dashed border-line hover:border-foreground hover:bg-neutral-50 transition-colors"
              >
                {uploading ? (
                  <Loader2 className="w-8 h-8 text-muted animate-spin" />
                ) : (
                  <ImagePlus className="w-8 h-8 text-muted" />
                )}
                <span className="text-sm font-semibold text-muted">
                  اضغط لرفع صورة التحويل
                </span>
                <span className="text-xs text-muted">JPG أو PNG أو WEBP</span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </section>

        <button
          type="submit"
          disabled={submitting}
          className="btn-press w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-foreground text-background font-bold text-base hover:bg-neutral-800 disabled:opacity-60"
        >
          {submitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {uploading ? 'جارٍ رفع إثبات الدفع...' : 'جارٍ إنشاء الطلب...'}
            </>
          ) : (
            <>
              <UploadCloud className="w-5 h-5" />
              إتمام الطلب — {formatPrice(total)}
            </>
          )}
        </button>
      </form>

      {/* Order summary */}
      <aside className="lg:col-span-1">
        <div className="bg-background rounded-3xl border border-line shadow-card p-6 space-y-4 sticky top-24">
          <h2 className="text-lg font-black">تفاصيل الطلب</h2>
          <div className="space-y-3 max-h-72 overflow-y-auto">
            {items.map((item) => (
              <div key={item.product_id} className="flex gap-3 items-center">
                <div className="relative w-14 h-16 shrink-0 rounded-xl overflow-hidden bg-neutral-100">
                  <Image
                    src={item.image_url || ''}
                    alt={item.name}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold line-clamp-1">{item.name}</p>
                  <p className="text-xs text-muted">× {item.quantity}</p>
                </div>
                <span className="text-sm font-bold">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-line pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-muted">
              <span>المجموع الفرعي</span>
              <span className="text-foreground font-semibold">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted">
              <span>التوصيل</span>
              <span className="text-foreground font-semibold">
                {deliveryFee > 0 ? formatPrice(deliveryFee) : 'مجاني'}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-line">
              <span className="font-bold">الإجمالي</span>
              <span className="text-2xl font-black">{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-bold">{label}</label>
      {children}
    </div>
  )
}
