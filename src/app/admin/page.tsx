import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { StatsCard } from '@/components/admin/StatsCard'
import { Product, Category } from '@/types/database'
import { formatPrice, formatDate } from '@/lib/utils'
import {
  Package,
  Layers,
  CheckCircle2,
  XCircle,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  Store,
  Edit,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const supabase = createClient()

  // Fetch products
  const { data: productsData } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*)
    `)
    .order('created_at', { ascending: false })

  // Fetch categories
  const { data: categoriesData } = await supabase
    .from('categories')
    .select('*')

  const products = (productsData as unknown as Product[]) || []
  const categories = (categoriesData as Category[]) || []

  const totalProducts = products.length
  const availableProducts = products.filter((p) => p.is_available).length
  const unavailableProducts = totalProducts - availableProducts
  const totalCategories = categories.length

  const recentProducts = products.slice(0, 5)

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Dashboard Overview"
        description="Monitor real-time inventory, stock counts, and store performance."
        actionButton={
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-sm shadow-amber-500/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Product</span>
          </Link>
        }
      />

      <div className="p-6 sm:p-8 space-y-8 max-w-7xl w-full">
        {/* Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatsCard
            title="Total Products"
            value={totalProducts}
            subtitle="Catalog inventory count"
            icon={Package}
            colorScheme="amber"
          />
          <StatsCard
            title="Available in Store"
            value={availableProducts}
            subtitle="Active customer items"
            icon={CheckCircle2}
            colorScheme="emerald"
          />
          <StatsCard
            title="Out of Stock"
            value={unavailableProducts}
            subtitle="Temporarily disabled"
            icon={XCircle}
            colorScheme="red"
          />
          <StatsCard
            title="Menu Categories"
            value={totalCategories}
            subtitle="Active classifications"
            icon={Layers}
            colorScheme="blue"
          />
        </div>

        {/* Quick Actions & Live Data Info Banner */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-6 sm:p-8 border border-slate-700/60 shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <TrendingUp className="w-3.5 h-3.5" />
                Live Supabase PostgreSQL Database
              </span>
              <h2 className="text-xl sm:text-2xl font-bold">
                SAIF STORE Admin Management
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                Any price changes, new items, or category adjustments you make here update PostgreSQL immediately and are instantly visible to visitors on the public storefront.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/admin/products"
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm transition-all"
              >
                Manage Inventory
              </Link>
              <Link
                href="/admin/categories"
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs sm:text-sm border border-slate-600 transition-all"
              >
                Manage Categories
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Products Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Recently Added Items</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                The latest products synced in your database
              </p>
            </div>
            <Link
              href="/admin/products"
              className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 hover:text-amber-800"
            >
              <span>View All Inventory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/75 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-100">
                <tr>
                  <th scope="col" className="px-6 py-3.5">Product</th>
                  <th scope="col" className="px-6 py-3.5">Category</th>
                  <th scope="col" className="px-6 py-3.5">Price</th>
                  <th scope="col" className="px-6 py-3.5">Status</th>
                  <th scope="col" className="px-6 py-3.5">Created</th>
                  <th scope="col" className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentProducts.length > 0 ? (
                  recentProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                            <Image
                              src={
                                product.image_url ||
                                'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=150&q=80'
                              }
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm line-clamp-1">
                              {product.name}
                            </p>
                            <p className="text-xs text-slate-400 font-mono">
                              /{product.slug}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {product.category ? (
                          <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                            {product.category.name}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">Uncategorized</span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">
                        {formatPrice(product.price)}
                      </td>
                      <td className="px-6 py-4">
                        {product.is_available ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Available
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                            <XCircle className="w-3.5 h-3.5" />
                            Out of Stock
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {formatDate(product.created_at)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-slate-400">
                      No products recorded in database.
                    </td>
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
