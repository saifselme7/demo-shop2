import React from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/store/ProductCard'
import { Category, Product } from '@/types/database'
import { Search, PackageOpen, SlidersHorizontal } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface ProductsPageProps {
  searchParams: {
    category?: string
    search?: string
    sort?: string
  }
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const supabase = createClient()
  const { category: categorySlug, search: searchQuery, sort: sortOption } = searchParams

  const { data: categoriesData } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })

  const categories = (categoriesData as Category[]) || []

  let selectedCategoryId: string | null = null
  if (categorySlug) {
    const selectedCat = categories.find((c) => c.slug === categorySlug)
    if (selectedCat) selectedCategoryId = selectedCat.id
  }

  let query = supabase.from('products').select('*, category:categories(*)').eq('is_available', true)

  if (selectedCategoryId) query = query.eq('category_id', selectedCategoryId)
  if (searchQuery && searchQuery.trim().length > 0) {
    query = query.ilike('name', `%${searchQuery.trim()}%`)
  }

  if (sortOption === 'price-asc') query = query.order('price', { ascending: true })
  else if (sortOption === 'price-desc') query = query.order('price', { ascending: false })
  else query = query.order('created_at', { ascending: false })

  const { data: productsData } = await query
  const products = (productsData as unknown as Product[]) || []

  const sortHref = (sort: string) => ({
    pathname: '/products',
    query: {
      ...(categorySlug ? { category: categorySlug } : {}),
      ...(searchQuery ? { search: searchQuery } : {}),
      ...(sort ? { sort } : {}),
    },
  })

  return (
    <div className="container-x py-10 sm:py-14 space-y-8">
      {/* Header */}
      <div className="border-b border-line pb-6">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
          كتالوج المنتجات
        </h1>
        <p className="text-muted mt-2 text-sm sm:text-base">
          تصفّح أحدث تشكيلاتنا من الملابس والاكسسوارات.
        </p>
      </div>

      {/* Filter bar */}
      <div className="bg-background p-4 rounded-3xl border border-line shadow-card space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <form method="GET" className="relative w-full md:max-w-sm">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              name="search"
              defaultValue={searchQuery || ''}
              placeholder="ابحث عن منتج..."
              className="w-full pr-10 pl-4 py-2.5 rounded-full border border-line focus:outline-none focus:ring-2 focus:ring-foreground text-sm bg-offwhite"
            />
            {categorySlug && <input type="hidden" name="category" value={categorySlug} />}
            {sortOption && <input type="hidden" name="sort" value={sortOption} />}
          </form>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-xs font-semibold text-muted uppercase tracking-wider whitespace-nowrap flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              الترتيب:
            </span>
            <div className="flex gap-1.5 flex-wrap">
              {[
                { key: '', label: 'الأحدث' },
                { key: 'price-asc', label: 'السعر: الأقل' },
                { key: 'price-desc', label: 'السعر: الأعلى' },
              ].map((opt) => {
                const active = (sortOption || '') === opt.key
                return (
                  <Link
                    key={opt.key}
                    href={sortHref(opt.key)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                      active ? 'bg-foreground text-background' : 'bg-neutral-100 text-muted hover:bg-neutral-200'
                    }`}
                  >
                    {opt.label}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>

        {/* Category pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-2 border-t border-line">
          <Link
            href={sortHref('')}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
              !categorySlug ? 'bg-foreground text-background' : 'bg-neutral-100 text-muted hover:bg-neutral-200'
            }`}
          >
            الكل ({products.length})
          </Link>
          {categories.map((cat) => {
            const selected = categorySlug === cat.slug
            return (
              <Link
                key={cat.id}
                href={{
                  pathname: '/products',
                  query: {
                    category: cat.slug,
                    ...(searchQuery ? { search: searchQuery } : {}),
                    ...(sortOption ? { sort: sortOption } : {}),
                  },
                }}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                  selected ? 'bg-foreground text-background' : 'bg-neutral-100 text-muted hover:bg-neutral-200'
                }`}
              >
                {cat.name}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-background rounded-3xl border border-dashed border-line p-8">
          <PackageOpen className="w-12 h-12 text-muted mx-auto mb-3" />
          <h3 className="text-lg font-bold">لا توجد منتجات</h3>
          <p className="text-sm text-muted mt-1 max-w-sm mx-auto">
            {searchQuery
              ? `لم نجد نتائج مطابقة لـ "${searchQuery}". جرّب كلمات بحث أخرى.`
              : 'لا توجد منتجات متاحة في هذا القسم حالياً.'}
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-5 py-2.5 mt-5 rounded-full bg-foreground text-background text-sm font-bold hover:bg-neutral-800 transition-colors"
          >
            إعادة تعيين الفلاتر
          </Link>
        </div>
      )}
    </div>
  )
}
