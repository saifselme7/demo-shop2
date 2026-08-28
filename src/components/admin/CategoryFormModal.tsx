'use client'

import React, { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Category, Database } from '@/types/database'
import { createClient } from '@/lib/supabase/client'
import { slugify } from '@/lib/utils'
import { Loader2, AlertCircle } from 'lucide-react'

interface CategoryFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  initialData?: Category | null
}

export function CategoryFormModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: CategoryFormModalProps) {
  const supabase = createClient()
  const isEditing = Boolean(initialData)

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '')
      setSlug(initialData.slug || '')
      setDescription(initialData.description || '')
      setImageUrl(initialData.image_url || '')
    } else {
      setName('')
      setSlug('')
      setDescription('')
      setImageUrl('')
    }
    setError(null)
  }, [initialData, isOpen])

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setName(val)
    if (!isEditing || !slug) {
      setSlug(slugify(val))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('Category name is required.')
      return
    }

    const cleanSlug = slug.trim() ? slugify(slug) : slugify(name)

    setIsSubmitting(true)

    try {
      const payload: Database['public']['Tables']['categories']['Insert'] = {
        name: name.trim(),
        slug: cleanSlug,
        description: description.trim() || null,
        image_url: imageUrl.trim() || null,
      }

      if (isEditing && initialData?.id) {
        const { error: updateError } = await supabase
          .from('categories')
          .update(payload as any)
          .eq('id', initialData.id)

        if (updateError) throw updateError
      } else {
        const { error: insertError } = await supabase
          .from('categories')
          .insert([payload as any])

        if (insertError) throw insertError
      }

      onSuccess()
      onClose()
    } catch (err: any) {
      console.error('Error saving category:', err)
      setError(err.message || 'Failed to save category in Supabase database.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Category' : 'Create New Category'}
      description="Organize your menu and storefront collections."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-1">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Category Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={handleNameChange}
            placeholder="e.g. Specialty Coffees"
            required
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm bg-slate-50/50"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Slug <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(slugify(e.target.value))}
            placeholder="specialty-coffees"
            required
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm bg-slate-50/50 font-mono text-xs"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Brief overview of this category"
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm bg-slate-50/50"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Cover Image URL
          </label>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://images.unsplash.com/..."
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs bg-slate-50/50"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-colors disabled:opacity-50 shadow-sm"
          >
            {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{isEditing ? 'Save Changes' : 'Create Category'}</span>
          </button>
        </div>
      </form>
    </Modal>
  )
}
