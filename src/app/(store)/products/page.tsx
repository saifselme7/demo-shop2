import React from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/store/ProductCard'
import { Category, Product } from '@/types/database'
import { Search, SlidersHorizontal, Filter, PackageOpen } from 'lucide-react'

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

  // Fetch all categories for filter tabs
  const { data: categoriesData } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true })

  const categories = (categoriesData as Category[]) || []

  // Find category id if categorySlug is provided
  let selectedCategoryId: string | null = null
  if (categorySlug) {
    const selectedCat = categories.find((c) => c.slug === categorySlug)
    if (selectedCat) {
      selectedCategoryId = selectedCat.id
    }
  }

  // Build products query
  let query = supabase
    .from('products')
    .select(`
      *,
      category:categories(*)
    `)

  if (selectedCategoryId) {
    query = query.eq('category_id', selectedCategoryId)
  }

  if (searchQuery && searchQuery.trim().length > 0) {
    query = query.ilike('name', `%${searchQuery.trim()}%`)
  }

  // Sorting
  if (sortOption === 'price-asc') {
    query = query.order('price', { ascending: true })
  } else if (sortOption === 'price-desc') {
    query = query.order('price', { ascending: false })
  } else {
    // Default newest
    query = query.order('created_at', { ascending: false })
  }

  const { data: productsData } = await query
  const products = (productsData as unknown as Product[]) || []

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      {/* Page Header */}
      <div className="border-b border-slate-200/80 pb-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Product Catalog
        </h1>
        <p className="text-slate-500 mt-2 text-sm sm:text-base">
          Browse our entire selection of handcrafted beverages and culinary items.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Form */}
          <form method="GET" className="relative w-full md:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              name="search"
              defaultValue={searchQuery || ''}
              placeholder="Search products by name..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm bg-slate-50/50"
            />
            {categorySlug && <input type="hidden" name="category" value={categorySlug} />}
            {sortOption && <input type="hidden" name="sort" value={sortOption} />}
          </form>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
              Sort by:
            </span>
            <div className="flex gap-1.5 flex-wrap">
              <Link
                href={{
                  pathname: '/products',
                  query: {
                    ...(categorySlug ? { category: categorySlug } : {}),
                    ...(searchQuery ? { search: searchQuery } : {}),
                    sort: 'newest',
                  },
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  !sortOption || sortOption === 'newest'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Newest
              </Link>
              <Link
                href={{
                  pathname: '/products',
                  query: {
                    ...(categorySlug ? { category: categorySlug } : {}),
                    ...(searchQuery ? { search: searchQuery } : {}),
                    sort: 'price-asc',
                  },
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  sortOption === 'price-asc'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Price: Low to High
              </Link>
              <Link
                href={{
                  pathname: '/products',
                  query: {
                    ...(categorySlug ? { category: categorySlug } : {}),
                    ...(searchQuery ? { search: searchQuery } : {}),
                    sort: 'price-desc',
                  },
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  sortOption === 'price-desc'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Price: High to Low
              </Link>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-2 border-t border-slate-100">
          <Link
            href={{
              pathname: '/products',
              query: {
                ...(searchQuery ? { search: searchQuery } : {}),
                ...(sortOption ? { sort: sortOption } : {}),
              },
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
              !categorySlug
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
            }`}
          >
            All Categories ({products.length})
          </Link>
          {categories.map((cat) => {
            const isSelected = categorySlug === cat.slug
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
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
                }`}
              >
                {cat.name}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Product Grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200 p-8">
          <PackageOpen className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No products found</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? `No products matching "${searchQuery}". Try adjusting your search term.`
              : 'There are no products available in this category yet.'}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/products"
              className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors"
            >
              Reset Filters
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
