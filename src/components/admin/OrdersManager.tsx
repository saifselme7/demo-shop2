'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { formatPrice, formatDate } from '@/lib/utils'
import type { Order, OrderItem, OrderStatus, PaymentStatus } from '@/types/database'
import type { OrderWithItems } from '@/app/admin/orders/page'
import { Modal } from '@/components/ui/Modal'
import {
  Search,
  Eye,
  Check,
  X,
  Clock,
  Loader2,
  AlertCircle,
  FileImage,
  ExternalLink,
} from 'lucide-react'

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  vodafone_cash: 'فودافون كاش',
  instapay: 'انستاباي',
}

const PAYMENT_STATUS: Record<PaymentStatus, { label: string; cls: string }> = {
  pending: { label: 'بانتظار المراجعة', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  approved: { label: 'مؤكد', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  rejected: { label: 'مرفوض', cls: 'bg-red-50 text-red-700 border-red-200' },
}

const ORDER_STATUS: Record<OrderStatus, { label: string; cls: string }> = {
  pending: { label: 'قيد المراجعة', cls: 'bg-slate-100 text-slate-600 border-slate-200' },
  confirmed: { label: 'تم التأكيد', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  preparing: { label: 'جارٍ التجهيز', cls: 'bg-purple-50 text-purple-700 border-purple-200' },
  shipped: { label: 'تم الشحن', cls: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  delivered: { label: 'تم التسليم', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  cancelled: { label: 'ملغي', cls: 'bg-red-50 text-red-700 border-red-200' },
}

export function OrdersManager({ initialOrders }: { initialOrders: OrderWithItems[] }) {
  const supabase = createClient()
  const router = useRouter()

  const [orders, setOrders] = useState<OrderWithItems[]>(initialOrders)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPayment, setFilterPayment] = useState('all')

  const [selected, setSelected] = useState<OrderWithItems | null>(null)
  const [proofUrl, setProofUrl] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [acting, setActing] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [feedbackType, setFeedbackType] = useState<'success' | 'error'>('success')

  const filtered = orders.filter((o) => {
    const matchSearch =
      !search ||
      o.order_number.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_name.includes(search) ||
      o.customer_phone.includes(search)
    const matchStatus = filterStatus === 'all' || o.status === filterStatus
    const matchPayment = filterPayment === 'all' || o.payment_status === filterPayment
    return matchSearch && matchStatus && matchPayment
  })

  const refreshOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false })
    if (data) setOrders(data as unknown as OrderWithItems[])
    router.refresh()
  }

  const openOrder = async (order: OrderWithItems) => {
    setSelected(order)
    setRejectionReason(order.payment_rejection_reason || '')
    setProofUrl(null)
    if (order.payment_proof_path) {
      const { data } = await supabase.storage
        .from('payment-proofs')
        .createSignedUrl(order.payment_proof_path, 300)
      setProofUrl(data?.signedUrl || null)
    }
  }

  const updatePayment = async (status: PaymentStatus) => {
    if (!selected) return
    setActing(true)
    setFeedback(null)
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          payment_status: status,
          payment_rejection_reason: status === 'rejected' ? rejectionReason || null : null,
          payment_reviewed_at: new Date().toISOString(),
        })
        .eq('id', selected.id)
      if (error) throw error
      setFeedback(
        status === 'approved'
          ? 'تمت الموافقة على الدفع.'
          : status === 'rejected'
            ? 'تم رفض الدفع.'
            : 'تمت إعادة الحالة إلى قيد المراجعة.'
      )
      setFeedbackType('success')
      setSelected({ ...selected, payment_status: status })
      await refreshOrders()
    } catch (err: any) {
      setFeedback(err.message || 'فشل تحديث حالة الدفع.')
      setFeedbackType('error')
    } finally {
      setActing(false)
    }
  }

  const updateOrderStatus = async (status: OrderStatus) => {
    if (!selected) return
    setActing(true)
    setFeedback(null)
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', selected.id)
      if (error) throw error
      setSelected({ ...selected, status })
      setFeedbackType('success')
      setFeedback('تم تحديث حالة الطلب.')
      await refreshOrders()
    } catch (err: any) {
      setFeedback(err.message || 'فشل تحديث حالة الطلب.')
      setFeedbackType('error')
    } finally {
      setActing(false)
    }
  }

  const counts = {
    total: orders.length,
    pendingPayment: orders.filter((o) => o.payment_status === 'pending').length,
    approved: orders.filter((o) => o.payment_status === 'approved').length,
    new: orders.filter((o) => o.status === 'pending').length,
  }

  return (
    <div className="space-y-6">
      {feedback && (
        <div
          className={`p-4 rounded-xl border text-sm flex items-center justify-between ${
            feedbackType === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <span>{feedback}</span>
          <button onClick={() => setFeedback(null)} className="text-xs font-semibold underline">
            إغلاق
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="إجمالي الطلبات" value={counts.total} />
        <StatCard label="دفع قيد المراجعة" value={counts.pendingPayment} accent="amber" />
        <StatCard label="دفع مؤكد" value={counts.approved} accent="emerald" />
        <StatCard label="طلبات جديدة" value={counts.new} accent="blue" />
      </div>

      {/* Filters */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث برقم الطلب، الاسم، الموبايل..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm bg-slate-50/50"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm"
          >
            <option value="all">كل حالات الطلب</option>
            {Object.entries(ORDER_STATUS).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <select
            value={filterPayment}
            onChange={(e) => setFilterPayment(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm"
          >
            <option value="all">كل حالات الدفع</option>
            <option value="pending">دفع قيد المراجعة</option>
            <option value="approved">دفع مؤكد</option>
            <option value="rejected">دفع مرفوض</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm text-slate-600">
            <thead className="bg-slate-50/75 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">الطلب</th>
                <th className="px-6 py-3.5">العميل</th>
                <th className="px-6 py-3.5">الإجمالي</th>
                <th className="px-6 py-3.5">حالة الطلب</th>
                <th className="px-6 py-3.5">حالة الدفع</th>
                <th className="px-6 py-3.5">التاريخ</th>
                <th className="px-6 py-3.5 text-left">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length > 0 ? (
                filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 font-mono text-xs" dir="ltr">
                      {order.order_number}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">{order.customer_name}</p>
                      <p className="text-xs text-slate-400" dir="ltr">{order.customer_phone}</p>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">{formatPrice(order.total)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${ORDER_STATUS[order.status].cls}`}>
                        {ORDER_STATUS[order.status].label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${PAYMENT_STATUS[order.payment_status].cls}`}>
                        {PAYMENT_STATUS[order.payment_status].label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">{formatDate(order.created_at)}</td>
                    <td className="px-6 py-4 text-left">
                      <button
                        onClick={() => openOrder(order)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-white hover:bg-slate-700 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        مراجعة
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    لا توجد طلبات مطابقة.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail modal */}
      <Modal
        isOpen={Boolean(selected)}
        onClose={() => setSelected(null)}
        title="تفاصيل الطلب"
        description={selected?.order_number}
        maxWidth="2xl"
      >
        {selected && (
          <div className="space-y-6">
            {/* Payment review */}
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-3">
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                مراجعة الدفع
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Info label="طريقة الدفع" value={PAYMENT_METHOD_LABEL[selected.payment_method || ''] || '—'} />
                <Info label="رقم التحويل" value={selected.payment_transfer_number || '—'} />
                <Info label="حالة الدفع" value={PAYMENT_STATUS[selected.payment_status].label} />
                <Info label="الإجمالي" value={formatPrice(selected.total)} />
              </div>

              {proofUrl ? (
                <div className="relative max-h-64 rounded-xl overflow-hidden bg-white border border-slate-200">
                  <Image src={proofUrl} alt="إثبات الدفع" width={800} height={500} className="object-contain w-full" />
                  <a
                    href={proofUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute top-2 left-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/70 text-white text-xs font-semibold hover:bg-black"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    فتح الصورة
                  </a>
                </div>
              ) : selected.payment_proof_path ? (
                <p className="text-xs text-slate-400 flex items-center gap-1.5">
                  <FileImage className="w-4 h-4" /> جارٍ تحميل الإثبات...
                </p>
              ) : (
                <p className="text-xs text-slate-400">لا يوجد إثبات دفع مرفق.</p>
              )}

              {selected.payment_status === 'rejected' && (
                <div className="text-sm">
                  <p className="font-semibold text-red-700">سبب الرفض: {selected.payment_rejection_reason || 'غير محدد'}</p>
                </div>
              )}

              <div className="space-y-2 pt-1">
                {selected.payment_status === 'rejected' && (
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={2}
                    placeholder="سبب الرفض (يظهر للعميل)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                )}
                <div className="flex flex-wrap gap-2">
                  <button
                    disabled={acting}
                    onClick={() => updatePayment('approved')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors disabled:opacity-50"
                  >
                    {acting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    موافقة على الدفع
                  </button>
                  <button
                    disabled={acting}
                    onClick={() => updatePayment('rejected')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors disabled:opacity-50"
                  >
                    {acting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                    رفض الدفع
                  </button>
                  <button
                    disabled={acting}
                    onClick={() => updatePayment('pending')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors disabled:opacity-50"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    قيد المراجعة
                  </button>
                </div>
              </div>
            </div>

            {/* Order status */}
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-2">
              <h3 className="font-bold text-sm text-slate-800">حالة الطلب</h3>
              <select
                value={selected.status}
                onChange={(e) => updateOrderStatus(e.target.value as OrderStatus)}
                disabled={acting}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
              >
                {Object.entries(ORDER_STATUS).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>

            {/* Customer */}
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-2 text-sm">
              <h3 className="font-bold text-slate-800">بيانات العميل</h3>
              <Info label="الاسم" value={selected.customer_name} />
              <Info label="الهاتف" value={selected.customer_phone} />
              {selected.customer_email && <Info label="البريد" value={selected.customer_email} />}
              <Info label="العنوان" value={selected.shipping_address} />
              {selected.notes && <Info label="ملاحظات" value={selected.notes} />}
            </div>

            {/* Items */}
            <div className="space-y-2">
              <h3 className="font-bold text-sm text-slate-800">المنتجات</h3>
              {selected.order_items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl p-3">
                  <div className="relative w-12 h-14 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                    {item.product_image && (
                      <Image src={item.product_image} alt={item.product_name} fill sizes="48px" className="object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900">{item.product_name}</p>
                    <p className="text-xs text-slate-400">× {item.quantity}</p>
                  </div>
                  <span className="text-sm font-bold text-slate-900">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 pt-3 flex justify-between text-sm">
              <span className="text-slate-500">المجموع الفرعي: {formatPrice(selected.subtotal)}</span>
              <span className="text-slate-500">التوصيل: {formatPrice(selected.delivery_fee)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-900">الإجمالي</span>
              <span className="text-2xl font-black text-slate-900">{formatPrice(selected.total)}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

function StatCard({ label, value, accent = 'default' }: { label: string; value: number; accent?: string }) {
  const cls =
    accent === 'amber'
      ? 'text-amber-600 bg-amber-50 border-amber-200'
      : accent === 'emerald'
        ? 'text-emerald-600 bg-emerald-50 border-emerald-200'
        : accent === 'blue'
          ? 'text-blue-600 bg-blue-50 border-blue-200'
          : 'text-slate-900 bg-slate-50 border-slate-200'
  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
      <p className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold border ${cls}`}>{label}</p>
      <p className="text-3xl font-black text-slate-900 mt-2">{value}</p>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">{label}</p>
      <p className="font-semibold text-slate-800 break-words">{value}</p>
    </div>
  )
}
