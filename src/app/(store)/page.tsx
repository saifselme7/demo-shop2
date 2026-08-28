import React from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { HeroBanner } from '@/components/store/HeroBanner'
import { ProductCard } from '@/components/store/ProductCard'
import { CategoryCard } from '@/components/store/CategoryCard'
import { Reveal } from '@/components/store/Reveal'
import { getStoreSettings } from '@/lib/store-settings'
import { Product, Category } from '@/types/database'
import { ArrowLeft, Sparkles, Layers } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const supabase = createClient()
  const settings = await getStoreSettings()

  const { data: categoriesData } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })

  const { data: featuredData } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('is_featured', true)
    .eq('is_available', true)
    .order('sort_order', { ascending: true })
    .limit(8)

  const { data: newData } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('is_available', true)
    .order('created_at', { ascending: false })
    .limit(4)

  const categories = (categoriesData as Category[]) || []
  const featured = (featuredData as unknown as Product[]) || []
  const newest = (newData as unknown as Product[]) || []

  return (
    <div className="pb-20">
      {/* Hero — appears immediately */}
      <HeroBanner
        title={String(settings.hero_title)}
        subtitle={String(settings.hero_subtitle)}
      />

      {/* Categories */}
      <section className="container-x pt-16 sm:pt-20">
        <Reveal className="flex items-end justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-muted mb-2">
              <Layers className="w-4 h-4" />
              <span>التصنيفات</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              تسوّق حسب القسم
            </h2>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-1 text-sm font-bold text-foreground hover:opacity-70 transition-opacity"
          >
            كل المنتجات
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Reveal>

        {categories.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {categories.map((category, i) => (
              <Reveal key={category.id} delay={i * 60}>
                <CategoryCard category={category} />
              </Reveal>
            ))}
          </div>
        ) : (
          <p className="text-muted text-sm">لم تُضف تصنيفات بعد.</p>
        )}
      </section>

      {/* Featured products */}
      <section className="container-x pt-16 sm:pt-24">
        <Reveal className="flex items-end justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-muted mb-2">
              <Sparkles className="w-4 h-4" />
              <span>مختارات</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              الأكثر تميزاً
            </h2>
          </div>
        </Reveal>

        {featured.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {featured.map((product, i) => (
              <Reveal key={product.id} delay={(i % 4) * 70}>
                <ProductCard product={product} />
              </Reveal>
            ))}
          </div>
        ) : (
          <p className="text-muted text-sm">لا توجد منتجات مميزة بعد.</p>
        )}
      </section>

      {/* New arrivals */}
      {newest.length > 0 && (
        <section className="container-x pt-16 sm:pt-24">
          <Reveal className="flex items-end justify-between mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-muted mb-2">
                <Sparkles className="w-4 h-4" />
                <span>وصل حديثاً</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                جديد المتجر
              </h2>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center gap-1 text-sm font-bold text-foreground hover:opacity-70 transition-opacity"
            >
              عرض الكل
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {newest.map((product, i) => (
              <Reveal key={product.id} delay={(i % 4) * 70}>
                <ProductCard product={product} />
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
