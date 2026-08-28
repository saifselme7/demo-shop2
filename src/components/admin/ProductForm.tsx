'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Category, Product, Database } from '@/types/database'
import { createClient } from '@/lib/supabase/client'
import { slugify, formatPrice } from '@/lib/utils'
import {
  UploadCloud,
  Image as ImageIcon,
  Loader2,
  Check,
  AlertCircle,
  ArrowLeft,
  X,
} from 'lucide-react'

interface ProductFormProps {
  initialData?: Product | null
  categories: Category[]
  isEditing?: boolean
}

export function ProductForm({
  initialData,
  categories,
  isEditing = false,
}: ProductFormProps) {
  const router = useRouter()
  const supabase = createClient()

  const [name, setName] = useState(initialData?.name || '')
  const [slug, setSlug] = useState(initialData?.slug || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [price, setPrice] = useState<string | number>(
    initialData?.price !== undefined ? initialData.price : ''
  )
  const [categoryId, setCategoryId] = useState(
    initialData?.category_id || (categories[0]?.id || '')
  )
  const [imageUrl, setImageUrl] = useState(initialData?.image_url || '')
  const [isAvailable, setIsAvailable] = useState(
    initialData?.is_available !== undefined ? initialData.is_available : true
  )

  const [uploadingImage, setUploadingImage] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Handle Name change and automatic slug suggestion
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setName(val)
    if (!isEditing || !slug) {
      setSlug(slugify(val))
    }
  }

  // Handle Image File Upload to Supabase Storage
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    setErrorMessage(null)

    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`
      const filePath = `products/${fileName}`

      // Upload to 'product-images' bucket
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        console.error('Storage Upload Error:', uploadError)
        throw new Error(
          uploadError.message ||
            'Failed to upload image to Supabase Storage. Ensure the "product-images" bucket exists.'
        )
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath)

      if (publicUrlData?.publicUrl) {
        setImageUrl(publicUrlData.publicUrl)
      }
    } catch (err: any) {
      console.error('Image upload failed:', err)
      setErrorMessage(
        err.message ||
          'Failed to upload image to Supabase Storage. Ensure the "product-images" bucket exists.'
      )
    } finally {
      setUploadingImage(false)
    }
  }

  // Handle Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    // Form Validation
    if (!name.trim()) {
      setErrorMessage('Product name is required.')
      return
    }

    const numericPrice = parseFloat(price.toString())
    if (isNaN(numericPrice) || numericPrice < 0) {
      setErrorMessage('Please enter a valid positive price.')
      return
    }

    const cleanSlug = slug.trim() ? slugify(slug) : slugify(name)
    if (!cleanSlug) {
      setErrorMessage('A valid URL slug is required.')
      return
    }

    setIsSubmitting(true)

    try {
      const productPayload: Database['public']['Tables']['products']['Insert'] = {
        name: name.trim(),
        slug: cleanSlug,
        description: description.trim() || null,
        price: numericPrice,
        category_id: categoryId || null,
        image_url: imageUrl.trim() || null,
        is_available: isAvailable,
      }

      if (isEditing && initialData?.id) {
        // Update product
        const { error } = await supabase
          .from('products')
          .update(productPayload as any)
          .eq('id', initialData.id)

        if (error) throw error
        setSuccessMessage('Product updated successfully!')
      } else {
        // Create product
        const { error } = await supabase
          .from('products')
          .insert([productPayload as any])

        if (error) throw error
        setSuccessMessage('Product created successfully!')
      }

      // Redirect back after brief delay
      setTimeout(() => {
        router.push('/admin/products')
        router.refresh()
      }, 1000)
    } catch (err: any) {
      console.error('Save product error:', err)
      setErrorMessage(
        err.message || 'Failed to save product in Supabase database.'
      )
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      {/* Notifications */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Error saving product</p>
            <p className="text-xs mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-center gap-3">
          <Check className="w-5 h-5 shrink-0" />
          <p className="font-bold">{successMessage}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Details (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-5">
            <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3">
              General Information
            </h3>

            {/* Product Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={handleNameChange}
                placeholder="e.g. Italian Caffè Latte"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm bg-slate-50/50"
              />
            </div>

            {/* Slug */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                URL Slug <span className="text-red-500">*</span>
              </label>
              <div className="flex rounded-xl shadow-xs">
                <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-200 bg-slate-100 text-slate-500 text-xs font-mono">
                  /products/
                </span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(slugify(e.target.value))}
                  placeholder="italian-caffe-latte"
                  required
                  className="w-full px-3 py-2.5 rounded-r-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm bg-slate-50/50 font-mono"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Enter rich flavor notes, ingredients, preparation style..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm bg-slate-50/50 leading-relaxed"
              />
            </div>
          </div>

          {/* Pricing and Category */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-5">
            <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3">
              Pricing & Classification
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Price in EGP */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Price (EGP) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="120.00"
                    required
                    className="w-full pl-4 pr-14 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm bg-slate-50/50 font-semibold"
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    EGP
                  </div>
                </div>
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm bg-slate-50/50"
                >
                  <option value="">Select a Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Controls (Right 1 col) */}
        <div className="space-y-6">
          {/* Availability Status Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3">
              Stock Status
            </h3>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900">
                  {isAvailable ? 'Item Available' : 'Out of Stock'}
                </p>
                <p className="text-xs text-slate-500">
                  {isAvailable
                    ? 'Displayed as in stock on store'
                    : 'Hidden or marked unavailable'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAvailable(!isAvailable)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isAvailable ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    isAvailable ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Product Media & Supabase Storage */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3">
              Product Image
            </h3>

            {/* Preview */}
            {imageUrl ? (
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                <Image
                  src={imageUrl}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-black text-white rounded-lg transition-colors"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="aspect-[4/3] rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-4 text-center bg-slate-50/50">
                <ImageIcon className="w-10 h-10 text-slate-300 mb-2" />
                <p className="text-xs font-semibold text-slate-600">No Image Uploaded</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Upload a file or enter a direct image URL</p>
              </div>
            )}

            {/* Storage File Upload */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Upload to Supabase Storage
              </label>
              <label className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer text-xs font-semibold text-slate-700 transition-colors">
                {uploadingImage ? (
                  <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                ) : (
                  <UploadCloud className="w-4 h-4 text-amber-600" />
                )}
                <span>{uploadingImage ? 'Uploading to Bucket...' : 'Select Local Image'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="hidden"
                />
              </label>
            </div>

            {/* Direct Image URL input */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Or Image URL
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs bg-slate-50/50"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting || uploadingImage}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md shadow-amber-600/20 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving to Database...</span>
                </>
              ) : (
                <span>{isEditing ? 'Save Product Changes' : 'Publish Product to Store'}</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => router.push('/admin/products')}
              className="w-full px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
            >
              Cancel & Return
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}
