'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Product, Category } from '@/types/database'
import { createClient } from '@/lib/supabase/client'
import { formatPrice, formatDate } from '@/lib/utils'
import { ConfirmDeleteModal } from '@/components/ui/ConfirmDeleteModal'
import {
  Search,
  Filter,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  ExternalLink,
  PlusCircle,
  Loader2,
  AlertCircle,
  Check,
} from 'lucide-react'

interface ProductListTableProps {
  initialProducts: Product[]
  categories: Category[]
}

export function ProductListTable({
  initialProducts,
  categories,
}: ProductListTableProps) {
  const router = useRouter()
  const supabase = createClient()

  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')

  // Deletion Modal state
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Toggle availability loading state
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  )

  // Filter products locally for instant response
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory =
      selectedCategory === 'all' || product.category_id === selectedCategory

    const matchesStatus =
      selectedStatus === 'all' ||
      (selectedStatus === 'available' && product.is_available) ||
      (selectedStatus === 'unavailable' && !product.is_available)

    return matchesSearch && matchesCategory && matchesStatus
  })

  // Quick Availability Toggle handler
  const handleToggleAvailability = async (product: Product) => {
    const newStatus = !product.is_available
    setTogglingId(product.id)
    setFeedback(null)

    try {
      const { error } = await supabase
        .from('products')
        .update({ is_available: newStatus })
        .eq('id', product.id)

      if (error) throw error

      // Update local state
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, is_available: newStatus } : p))
      )
      setFeedback({
        type: 'success',
        message: `"${product.name}" marked as ${newStatus ? 'Available' : 'Out of Stock'}.`,
      })
      router.refresh()
    } catch (err: any) {
      console.error('Toggle error:', err)
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to update product status.',
      })
    } finally {
      setTogglingId(null)
    }
  }

  // Delete product handler
  const handleDeleteProduct = async () => {
    if (!productToDelete) return

    setIsDeleting(true)
    setFeedback(null)

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productToDelete.id)

      if (error) throw error

      // Remove from state
      setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id))
      setFeedback({
        type: 'success',
        message: `Product "${productToDelete.name}" deleted successfully.`,
      })
      setProductToDelete(null)
      router.refresh()
    } catch (err: any) {
      console.error('Delete error:', err)
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to delete product from database.',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const defaultImage =
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=150&q=80'

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-sm animate-in fade-in duration-200 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs font-semibold underline hover:opacity-75"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm bg-slate-50/50"
          />
        </div>

        {/* Dropdown filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Category */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Status */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">All Statuses</option>
            <option value="available">Available Only</option>
            <option value="unavailable">Out of Stock Only</option>
          </select>

          {/* Add product button */}
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-sm shadow-amber-500/20 ml-auto md:ml-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/75 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-100">
              <tr>
                <th scope="col" className="px-6 py-3.5">Product</th>
                <th scope="col" className="px-6 py-3.5">Category</th>
                <th scope="col" className="px-6 py-3.5">Price</th>
                <th scope="col" className="px-6 py-3.5">Availability Toggle</th>
                <th scope="col" className="px-6 py-3.5">Last Updated</th>
                <th scope="col" className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Image and Name */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                          <Image
                            src={product.image_url || defaultImage}
                            alt={product.name}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">
                            {product.name}
                          </p>
                          <p className="text-xs text-slate-400 font-mono">
                            /{product.slug}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4">
                      {product.category ? (
                        <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                          {product.category.name}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Uncategorized</span>
                      )}
                    </td>

                    {/* Price */}
                    <td className="px-6 py-4">
                      <span className="text-base font-extrabold text-slate-900">
                        {formatPrice(product.price)}
                      </span>
                    </td>

                    {/* Availability Toggle Switch */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => handleToggleAvailability(product)}
                          disabled={togglingId === product.id}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            product.is_available ? 'bg-emerald-500' : 'bg-slate-300'
                          } ${togglingId === product.id ? 'opacity-50' : ''}`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              product.is_available ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                        <span className="text-xs font-semibold">
                          {togglingId === product.id ? (
                            <span className="text-slate-400 flex items-center gap-1">
                              <Loader2 className="w-3 h-3 animate-spin" /> Saving...
                            </span>
                          ) : product.is_available ? (
                            <span className="text-emerald-700">Available</span>
                          ) : (
                            <span className="text-red-600">Out of Stock</span>
                          )}
                        </span>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {formatDate(product.updated_at || product.created_at)}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/products/${product.slug}`}
                          target="_blank"
                          title="View on store"
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>

                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          title="Edit product"
                          className="p-1.5 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>

                        <button
                          type="button"
                          onClick={() => setProductToDelete(product)}
                          title="Delete product"
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No products matching your search or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Safe Dialog */}
      <ConfirmDeleteModal
        isOpen={Boolean(productToDelete)}
        onClose={() => setProductToDelete(null)}
        onConfirm={handleDeleteProduct}
        title="Confirm Product Deletion"
        message="Are you sure you want to permanently delete this product from the Supabase database?"
        itemName={productToDelete?.name}
        isLoading={isDeleting}
      />
    </div>
  )
}
