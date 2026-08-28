'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Category, Product, Database } from '@/types/database'
import { createClient } from '@/lib/supabase/client'
import { slugify } from '@/lib/utils'
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

export function ProductForm({ initialData, categories, isEditing = false }: ProductFormProps) {
  const router = useRouter()
  const supabase = createClient()

  const [name, setName] = useState(initialData?.name || '')
  const [slug, setSlug] = useState(initialData?.slug || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [price, setPrice] = useState<string>(initialData?.price != null ? String(initialData.price) : '')
  const [oldPrice, setOldPrice] = useState<string>(
    initialData?.old_price != null ? String(initialData.old_price) : ''
  )
  const [categoryId, setCategoryId] = useState(initialData?.category_id || categories[0]?.id || '')
  const [imageUrl, setImageUrl] = useState(initialData?.image_url || '')
  const [isAvailable, setIsAvailable] = useState(
    initialData?.is_available !== undefined ? initialData.is_available : true
  )
  const [isFeatured, setIsFeatured] = useState(initialData?.is_featured || false)
  const [stock, setStock] = useState<string>(
    initialData?.stock != null ? String(initialData.stock) : ''
  )
  const [sortOrder, setSortOrder] = useState<string>(
    initialData?.sort_order != null ? String(initialData.sort_order) : '0'
  )

  const [uploadingImage, setUploadingImage] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setName(val)
    if (!isEditing || !slug) setSlug(slugify(val))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingImage(true)
    setErrorMessage(null)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`
      const filePath = `products/${fileName}`
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, { cacheControl: '3600', upsert: false })
      if (uploadError) {
        throw new Error(
          uploadError.message ||
            'فشل رفع الصورة. تأكد من إنشاء بوكيت "product-images" (عام) في التخزين.'
        )
      }
      const { data: publicUrlData } = supabase.storage.from('product-images').getPublicUrl(filePath)
      if (publicUrlData?.publicUrl) setImageUrl(publicUrlData.publicUrl)
    } catch (err: any) {
      console.error('Image upload failed:', err)
      setErrorMessage(err.message || 'فشل رفع الصورة إلى التخزين.')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    if (!name.trim()) return setErrorMessage('اسم المنتج مطلوب.')
    const numericPrice = parseFloat(price)
    if (isNaN(numericPrice) || numericPrice < 0) return setErrorMessage('أدخل سعراً صحيحاً.')
    const cleanSlug = slug.trim() ? slugify(slug) : slugify(name)
    if (!cleanSlug) return setErrorMessage('الرابط (Slug) مطلوب.')

    const numericOld =
      oldPrice.trim() === '' ? null : parseFloat(oldPrice)
    const numericStock = stock.trim() === '' ? null : parseInt(stock, 10)

    if (numericOld != null && (isNaN(numericOld) || numericOld < numericPrice)) {
      return setErrorMessage('السعر القديم يجب أن يكون أكبر من أو يساوي السعر الحالي.')
    }

    setIsSubmitting(true)
    try {
      const productPayload: Database['public']['Tables']['products']['Insert'] = {
        name: name.trim(),
        slug: cleanSlug,
        description: description.trim() || null,
        price: numericPrice,
        old_price: numericOld,
        category_id: categoryId || null,
        image_url: imageUrl.trim() || null,
        is_available: isAvailable,
        is_featured: isFeatured,
        stock: numericStock,
        sort_order: parseInt(sortOrder, 10) || 0,
      }

      if (isEditing && initialData?.id) {
        const { error } = await supabase.from('products').update(productPayload as any).eq('id', initialData.id)
        if (error) throw error
        setSuccessMessage('تم تحديث المنتج بنجاح!')
      } else {
        const { error } = await supabase.from('products').insert([productPayload as any])
        if (error) throw error
        setSuccessMessage('تم إنشاء المنتج بنجاح!')
      }

      setTimeout(() => {
        router.push('/admin/products')
        router.refresh()
      }, 1000)
    } catch (err: any) {
      console.error('Save product error:', err)
      setErrorMessage(err.message || 'فشل حفظ المنتج في قاعدة البيانات.')
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">خطأ في حفظ المنتج</p>
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
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-5">
            <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3">
              البيانات الأساسية
            </h3>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                اسم المنتج <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={handleNameChange}
                placeholder="مثال: تيشيرت قطن كلاسيك أبيض"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm bg-slate-50/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                الرابط (Slug) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(slugify(e.target.value))}
                placeholder="tshirt-cotton-classic-white"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm bg-slate-50/50 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                الوصف
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="وصف تفصيلي للمنتج، الخامة، المقاس..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm bg-slate-50/50"
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-5">
            <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3">
              السعر والتصنيف
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  السعر (جنيه) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="299"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm bg-slate-50/50 font-semibold"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  السعر القديم / قبل الخصم
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={oldPrice}
                  onChange={(e) => setOldPrice(e.target.value)}
                  placeholder="اختياري"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm bg-slate-50/50 font-semibold"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  الكمية المتاحة (المخزون)
                </label>
                <input
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="اتركه فارغاً لغير المحدود"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm bg-slate-50/50"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  ترتيب العرض
                </label>
                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm bg-slate-50/50"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                التصنيف
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm bg-slate-50/50"
              >
                <option value="">اختر تصنيفاً</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3">
              الحالة والظهور
            </h3>
            <Toggle
              label={isAvailable ? 'متاح للبيع' : 'غير متاح'}
              sub={isAvailable ? 'يظهر في المتجر' : 'مخفي/غير متاح'}
              checked={isAvailable}
              onChange={() => setIsAvailable(!isAvailable)}
            />
            <Toggle
              label={isFeatured ? 'منتج مميّز' : 'ليس مميزاً'}
              sub={isFeatured ? 'يظهر في قسم المميز' : 'لا يظهر في قسم المميز'}
              checked={isFeatured}
              onChange={() => setIsFeatured(!isFeatured)}
            />
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3">
              صورة المنتج
            </h3>
            {imageUrl ? (
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                <Image src={imageUrl} alt="معاينة" fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="absolute top-2 left-2 p-1.5 bg-black/70 hover:bg-black text-white rounded-lg transition-colors"
                  title="إزالة الصورة"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="aspect-[4/3] rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-4 text-center bg-slate-50/50">
                <ImageIcon className="w-10 h-10 text-slate-300 mb-2" />
                <p className="text-xs font-semibold text-slate-600">لا توجد صورة</p>
                <p className="text-[11px] text-slate-400 mt-0.5">ارفع ملفاً أو أدخل رابط صورة</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">رفع إلى التخزين</label>
              <label className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer text-xs font-semibold text-slate-700 transition-colors">
                {uploadingImage ? (
                  <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                ) : (
                  <UploadCloud className="w-4 h-4 text-amber-600" />
                )}
                <span>{uploadingImage ? 'جارٍ الرفع...' : 'اختر صورة من الجهاز'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="hidden"
                />
              </label>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                أو رابط صورة
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

          <div className="space-y-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting || uploadingImage}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md shadow-amber-600/20 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جارٍ الحفظ...</span>
                </>
              ) : (
                <span>{isEditing ? 'حفظ التعديلات' : 'نشر المنتج'}</span>
              )}
            </button>
            <button
              type="button"
              onClick={() => router.push('/admin/products')}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              إلغاء والعودة
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}

function Toggle({
  label,
  sub,
  checked,
  onChange,
}: {
  label: string
  sub: string
  checked: boolean
  onChange: () => void
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-bold text-slate-900">{label}</p>
        <p className="text-xs text-slate-500">{sub}</p>
      </div>
      <button
        type="button"
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
          checked ? 'bg-emerald-500' : 'bg-slate-300'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  )
}
