import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/store/ProductCard'
import { Product } from '@/types/database'
import { formatPrice, formatDate } from '@/lib/utils'
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Tag,
  ShieldCheck,
  Sparkles,
  Calendar,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

interface ProductDetailPageProps {
  params: {
    slug: string
  }
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const supabase = createClient()
  const { slug } = params

  // Fetch product with category
  const { data: productData, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*)
    `)
    .eq('slug', slug)
    .maybeSingle()

  if (error || !productData) {
    notFound()
  }

  const product = productData as unknown as Product

  // Fetch related products in the same category
  const { data: relatedProductsData } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*)
    `)
    .eq('category_id', product.category_id || '')
    .neq('id', product.id)
    .limit(4)

  const relatedProducts = (relatedProductsData as unknown as Product[]) || []

  const defaultImage =
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      {/* Breadcrumb / Back button */}
      <div>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Products</span>
        </Link>
      </div>

      {/* Main Product Section */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden p-6 sm:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
          {/* Image */}
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 shadow-md">
            <Image
              src={product.image_url || defaultImage}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            {/* Status overlay */}
            <div className="absolute top-4 left-4">
              {product.is_available ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-500 text-white backdrop-blur-md shadow-md">
                  <CheckCircle2 className="w-4 h-4" />
                  In Stock & Ready
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-red-600 text-white backdrop-blur-md shadow-md">
                  <XCircle className="w-4 h-4" />
                  Currently Unavailable
                </span>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {product.category && (
                <Link
                  href={`/categories/${product.category.slug}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 hover:bg-amber-100 transition-colors border border-amber-200/60"
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span>{product.category.name}</span>
                </Link>
              )}

              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                {product.name}
              </h1>

              <div className="pt-2">
                <span className="text-xs text-slate-400 uppercase tracking-wider block font-semibold">
                  Price
                </span>
                <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  {formatPrice(product.price)}
                </span>
              </div>

              <div className="prose prose-slate max-w-none pt-4 text-slate-600 leading-relaxed">
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-1.5">
                  Description
                </h4>
                <p className="text-base text-slate-600 whitespace-pre-line">
                  {product.description || 'Artisan handcrafted recipe made fresh to order using finest ingredients.'}
                </p>
              </div>
            </div>

            {/* Live Database Info Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs text-slate-500">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-medium text-slate-700">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  Database Synced
                </span>
                <span className="text-slate-400 font-mono">ID: {product.id.slice(0, 8)}...</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Created
                </span>
                <span>{formatDate(product.created_at)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6 pt-6">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            More from {product.category?.name || 'this category'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relProduct) => (
              <ProductCard key={relProduct.id} product={relProduct} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
