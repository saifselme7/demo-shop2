import React from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { StatsCard } from '@/components/admin/StatsCard'
import { Product } from '@/types/database'
import { formatPrice, formatDate } from '@/lib/utils'
import {
  Package,
  Layers,
  ClipboardList,
  Clock,
  PlusCircle,
  ArrowLeft,
  TrendingUp,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const supabase = createClient()

  const [{ data: productsData }, { data: categoriesData }, { data: ordersData }] =
    await Promise.all([
      supabase.from('products').select('*, category:categories(*)').order('created_at', { ascending: false }),
      supabase.from('categories').select('*'),
      supabase.from('orders').select('*').order('created_at', { ascending: false }),
    ])

  const products = (productsData as unknown as Product[]) || []
  const categories = (categoriesData as any[]) || []
  const orders = (ordersData as any[]) || []

  const totalProducts = products.length
  const availableProducts = products.filter((p) => p.is_available).length
  const totalCategories = categories.length
  const pendingPayments = orders.filter((o) => o.payment_status === 'pending').length
  const newOrders = orders.filter((o) => o.status === 'pending').length
  const totalRevenue = orders
    .filter((o) => o.payment_status === 'approved')
    .reduce((s, o) => s + Number(o.total || 0), 0)

  const recentOrders = orders.slice(0, 5)

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="نظرة عامة"
        description="راقب المنتجات والمخزون والطلبات ومراجعات الدفع."
        actionButton={
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-sm shadow-amber-500/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>إضافة منتج</span>
          </Link>
        }
      />

      <div className="p-6 sm:p-8 space-y-8 max-w-7xl w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatsCard title="إجمالي المنتجات" value={totalProducts} subtitle="عدد المنتجات في الكتالوج" icon={Package} colorScheme="amber" />
          <StatsCard title="متوفر للبيع" value={availableProducts} subtitle="منتجات نشطة" icon={Package} colorScheme="emerald" />
          <StatsCard title="التصنيفات" value={totalCategories} subtitle="تصنيفات المتجر" icon={Layers} colorScheme="blue" />
          <StatsCard title="دفع قيد المراجعة" value={pendingPayments} subtitle="بانتظار موافقتك" icon={Clock} colorScheme="red" />
        </div>

        {/* Order overview banner */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-6 sm:p-8 border border-slate-700/60 shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <TrendingUp className="w-3.5 h-3.5" />
                إدارة متجر سيف ستور
              </span>
              <h2 className="text-xl sm:text-2xl font-bold">إدارة الطلبات والدفع</h2>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                {newOrders} طلب جديد — {pendingPayments} عملية دفع بانتظار المراجعة. الإيرادات المؤكدة: {formatPrice(totalRevenue)}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/admin/orders"
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm transition-all"
              >
                مراجعة الطلبات
              </Link>
              <Link
                href="/admin/products"
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs sm:text-sm border border-slate-600 transition-all"
              >
                إدارة المنتجات
              </Link>
            </div>
          </div>
        </div>

        {/* Recent orders */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">أحدث الطلبات</h3>
              <p className="text-xs text-slate-500 mt-0.5">آخر الطلبات في قاعدة البيانات</p>
            </div>
            <Link href="/admin/orders" className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 hover:text-amber-800">
              <span>كل الطلبات</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm text-slate-600">
              <thead className="bg-slate-50/75 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">الطلب</th>
                  <th className="px-6 py-3.5">العميل</th>
                  <th className="px-6 py-3.5">الإجمالي</th>
                  <th className="px-6 py-3.5">حالة الدفع</th>
                  <th className="px-6 py-3.5">التاريخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900 font-mono text-xs" dir="ltr">{order.order_number}</td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-900">{order.customer_name}</p>
                        <p className="text-xs text-slate-400" dir="ltr">{order.customer_phone}</p>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">{formatPrice(order.total)}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${
                            order.payment_status === 'approved'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : order.payment_status === 'rejected'
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {order.payment_status === 'approved' ? 'مؤكد' : order.payment_status === 'rejected' ? 'مرفوض' : 'قيد المراجعة'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">{formatDate(order.created_at)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">لا توجد طلبات بعد.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
