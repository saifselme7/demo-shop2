import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/store/ProductCard'
import { ProductPurchaseBox } from '@/components/store/ProductPurchaseBox'
import { Product, ProductImage } from '@/types/database'
import { formatPrice } from '@/lib/utils'
import { ArrowRight, Truck, ShieldCheck, RefreshCcw, Tag } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface ProductDetailPageProps {
  params: { slug: string }
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const supabase = createClient()
  const { slug } = params

  const { data: productData, error } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('slug', slug)
    .maybeSingle()

  if (error || !productData) notFound()

  const product = productData as unknown as Product

  const { data: galleryData } = await supabase
    .from('product_images')
    .select('*')
    .eq('product_id', product.id)
    .order('sort_order', { ascending: true })
  const gallery = (galleryData as ProductImage[]) || []

  const { data: relatedData } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('category_id', product.category_id || '')
    .neq('id', product.id)
    .eq('is_available', true)
    .limit(4)
  const related = (relatedData as unknown as Product[]) || []

  const images = gallery.map((g) => g.image_url).filter(Boolean) as string[]
  if (product.image_url) images.unshift(product.image_url)

  const discounted = product.old_price != null && product.old_price > product.price
  const out = !product.is_available

  return (
    <div className="container-x py-10 sm:py-14 space-y-12">
      {/* Breadcrumb */}
      <div>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-foreground transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          <span>كل المنتجات</span>
        </Link>
      </div>

      {/* Main */}
      <div className="bg-background rounded-3xl border border-line shadow-card overflow-hidden p-5 sm:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14">
          {/* Gallery */}
          <div className="space-y-3">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-neutral-100">
              <Image
                src={images[0] || product.image_url || ''}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              {discounted && !out && (
                <span className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-foreground text-background text-xs font-bold">
                  خصم {Math.round(((product.old_price! - product.price) / product.old_price!) * 100)}٪
                </span>
              )}
              {out && (
                <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex items-center justify-center">
                  <span className="px-4 py-2 rounded-full bg-foreground text-background text-sm font-bold">
                    نفدت الكمية
                  </span>
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {images.slice(0, 4).map((src, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-neutral-100 border border-line">
                    <Image src={src} alt="" fill sizes="25vw" className="object-cover" loading="lazy" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col space-y-6">
            <div className="space-y-3">
              {product.category && (
                <Link
                  href={`/categories/${product.category.slug}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-neutral-100 text-muted hover:bg-neutral-200 transition-colors"
                >
                  <Tag className="w-3.5 h-3.5" />
                  {product.category.name}
                </Link>
              )}
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight">{product.name}</h1>

              <div className="flex items-baseline gap-3 pt-2">
                <span className="text-3xl sm:text-4xl font-black">{formatPrice(product.price)}</span>
                {discounted && (
                  <span className="text-xl text-muted line-through">{formatPrice(product.old_price)}</span>
                )}
              </div>

              <p className="text-neutral-700 leading-relaxed pt-3 whitespace-pre-line">
                {product.description || 'منتج من تشكيلة سيف ستور.'}
              </p>
            </div>

            <ProductPurchaseBox
              item={{
                product_id: product.id,
                slug: product.slug,
                name: product.name,
                price: product.price,
                old_price: product.old_price,
                image_url: product.image_url,
                quantity: 1,
                stock: product.stock,
              }}
            />

            {/* Shipping features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-line">
              <div className="flex items-center gap-2.5 text-xs text-muted">
                <Truck className="w-5 h-5" /> توصيل سريع
              </div>
              <div className="flex items-center gap-2.5 text-xs text-muted">
                <ShieldCheck className="w-5 h-5" /> جودة مضمونة
              </div>
              <div className="flex items-center gap-2.5 text-xs text-muted">
                <RefreshCcw className="w-5 h-5" /> استبدال خلال ٧ أيام
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="space-y-6 pt-4">
          <h2 className="text-2xl font-black tracking-tight">
            منتجات مشابهة
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {related.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
