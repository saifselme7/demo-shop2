import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/store/ProductCard'
import { Category, Product } from '@/types/database'
import { ArrowLeft, Layers, PackageOpen } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface CategoryPageProps {
  params: {
    slug: string
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const supabase = createClient()
  const { slug } = params

  // Fetch category
  const { data: categoryData, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()

  if (error || !categoryData) {
    notFound()
  }

  const category = categoryData as Category

  // Fetch products in this category
  const { data: productsData } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*)
    `)
    .eq('category_id', category.id)
    .order('created_at', { ascending: false })

  const products = (productsData as unknown as Product[]) || []

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      {/* Back button */}
      <div>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalog</span>
        </Link>
      </div>

      {/* Category Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 p-8 sm:p-12 text-white shadow-lg">
        {category.image_url && (
          <Image
            src={category.image_url}
            alt={category.name}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-35"
          />
        )}
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/90 text-slate-950 backdrop-blur-md">
            <Layers className="w-3.5 h-3.5" />
            <span>Category Collection</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">{category.name}</h1>
          {category.description && (
            <p className="text-slate-200 text-sm sm:text-base leading-relaxed pt-1">
              {category.description}
            </p>
          )}
          <p className="text-xs text-amber-300 font-medium pt-2">
            Showing {products.length} item{products.length === 1 ? '' : 's'}
          </p>
        </div>
      </div>

      {/* Products list */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200 p-8">
          <PackageOpen className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No products in this category yet</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            Items added under this category in the Admin Dashboard will automatically appear here.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/admin/products/new"
              className="px-4 py-2 rounded-xl bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700 transition-colors shadow-sm"
            >
              Add Product to Category
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
