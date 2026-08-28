import React from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { HeroBanner } from '@/components/store/HeroBanner'
import { ProductCard } from '@/components/store/ProductCard'
import { CategoryCard } from '@/components/store/CategoryCard'
import { Product, Category } from '@/types/database'
import { ArrowRight, Sparkles, Layers, Coffee } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const supabase = createClient()

  // Fetch categories
  const { data: categoriesData } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true })

  // Fetch featured products with their category
  const { data: productsData } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*)
    `)
    .order('created_at', { ascending: false })
    .limit(8)

  const categories = (categoriesData as Category[]) || []
  const products = (productsData as unknown as Product[]) || []

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* Hero */}
      <HeroBanner />

      {/* Featured Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md mb-2">
              <Layers className="w-3.5 h-3.5" />
              <span>Browse Categories</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Curated Collections
            </h2>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-1 text-sm font-semibold text-amber-700 hover:text-amber-800 transition-colors"
          >
            <span>Browse Full Menu</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {categories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200 p-8">
            <Layers className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-600 font-medium">No categories found in database yet.</p>
            <p className="text-xs text-slate-400 mt-1">Run the schema SQL in your Supabase SQL Editor or create them in the Admin Dashboard.</p>
          </div>
        )}
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Featured Menu</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Popular Items
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Handpicked customer favorites fresh from our kitchen and barista bar.
            </p>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-colors shadow-sm"
          >
            <span>View All Items</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200 p-8">
            <Coffee className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">No products found</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
              No products found in the database. Run the seed script in Supabase or add your first product through the admin panel.
            </p>
            <Link
              href="/admin/products/new"
              className="inline-flex items-center gap-2 px-4 py-2 mt-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm transition-colors shadow-sm"
            >
              Add First Product
            </Link>
          </div>
        )}
      </section>
    </div>
  )
}
