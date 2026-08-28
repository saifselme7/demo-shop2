import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/store/ProductCard'
import { Category, Product } from '@/types/database'
import { ArrowRight, PackageOpen } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface CategoryPageProps {
  params: { slug: string }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const supabase = createClient()
  const { slug } = params

  const { data: categoryData, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()

  if (error || !categoryData) notFound()
  const category = categoryData as Category

  const { data: productsData } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('category_id', category.id)
    .eq('is_available', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })
  const products = (productsData as unknown as Product[]) || []

  return (
    <div className="container-x py-10 sm:py-14 space-y-8">
      <div>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-foreground transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          <span>كل المنتجات</span>
        </Link>
      </div>

      {/* Category banner */}
      <div className="relative rounded-3xl overflow-hidden bg-foreground text-background p-8 sm:p-12 shadow-card">
        {category.image_url && (
          <Image
            src={category.image_url}
            alt={category.name}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-30"
          />
        )}
        <div className="relative z-10 max-w-2xl space-y-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border border-white/25">
            قسم المتجر
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">{category.name}</h1>
          {category.description && (
            <p className="text-neutral-200 text-sm sm:text-base leading-relaxed pt-1">
              {category.description}
            </p>
          )}
          <p className="text-xs text-neutral-300 font-medium pt-2">
            {products.length} منتج
          </p>
        </div>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 pt-2">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-background rounded-3xl border border-dashed border-line p-8">
          <PackageOpen className="w-12 h-12 text-muted mx-auto mb-3" />
          <h3 className="text-lg font-bold">لا توجد منتجات في هذا القسم</h3>
          <p className="text-sm text-muted mt-1">أضف منتجات من لوحة التحكم وستظهر هنا تلقائياً.</p>
        </div>
      )}
    </div>
  )
}
