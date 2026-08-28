'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Category } from '@/types/database'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'
import { CategoryFormModal } from '@/components/admin/CategoryFormModal'
import { ConfirmDeleteModal } from '@/components/ui/ConfirmDeleteModal'
import {
  PlusCircle,
  Edit,
  Trash2,
  ExternalLink,
  Layers,
  Check,
  AlertCircle,
} from 'lucide-react'

interface CategoryWithCount extends Category {
  product_count?: number
}

interface CategoryListManagerProps {
  initialCategories: CategoryWithCount[]
}

export function CategoryListManager({
  initialCategories,
}: CategoryListManagerProps) {
  const router = useRouter()
  const supabase = createClient()

  const [categories, setCategories] = useState<CategoryWithCount[]>(initialCategories)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null)

  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  )

  const handleOpenCreate = () => {
    setCategoryToEdit(null)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (category: Category) => {
    setCategoryToEdit(category)
    setIsModalOpen(true)
  }

  const handleSuccess = async () => {
    setFeedback({
      type: 'success',
      message: categoryToEdit ? 'Category updated successfully!' : 'Category created successfully!',
    })
    // Re-fetch categories
    const { data: updatedCategories } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true })

    if (updatedCategories) {
      setCategories(updatedCategories)
    }
    router.refresh()
  }

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return

    setIsDeleting(true)
    setFeedback(null)

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryToDelete.id)

      if (error) throw error

      setCategories((prev) => prev.filter((c) => c.id !== categoryToDelete.id))
      setFeedback({
        type: 'success',
        message: `Category "${categoryToDelete.name}" deleted successfully.`,
      })
      setCategoryToDelete(null)
      router.refresh()
    } catch (err: any) {
      console.error('Delete category error:', err)
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to delete category.',
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

      {/* Top action bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-base">Menu Categories</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Total {categories.length} categories configured in database
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-sm shadow-amber-500/20"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Category</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/75 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-100">
              <tr>
                <th scope="col" className="px-6 py-3.5">Category</th>
                <th scope="col" className="px-6 py-3.5">Slug</th>
                <th scope="col" className="px-6 py-3.5">Description</th>
                <th scope="col" className="px-6 py-3.5">Date Created</th>
                <th scope="col" className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categories.length > 0 ? (
                categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                          <Image
                            src={cat.image_url || defaultImage}
                            alt={cat.name}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                        <span className="font-bold text-slate-900 text-sm">
                          {cat.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-amber-700 bg-amber-50/40 w-fit rounded-lg">
                      /{cat.slug}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 max-w-xs truncate">
                      {cat.description || '—'}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {formatDate(cat.created_at)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/categories/${cat.slug}`}
                          target="_blank"
                          title="View on store"
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleOpenEdit(cat)}
                          title="Edit category"
                          className="p-1.5 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setCategoryToDelete(cat)}
                          title="Delete category"
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
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    No categories in database. Click "New Category" to add one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Category Create/Edit Modal */}
      <CategoryFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
        initialData={categoryToEdit}
      />

      {/* Safe Delete Modal */}
      <ConfirmDeleteModal
        isOpen={Boolean(categoryToDelete)}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={handleDeleteCategory}
        title="Confirm Category Deletion"
        message="Are you sure you want to permanently delete this category? Associated products may become uncategorized."
        itemName={categoryToDelete?.name}
        isLoading={isDeleting}
      />
    </div>
  )
}
