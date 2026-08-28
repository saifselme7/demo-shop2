import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Product } from '@/types/database'
import { formatPrice } from '@/lib/utils'
import { AddToCartButton } from './AddToCartButton'

const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80'

export function ProductCard({ product }: { product: Product }) {
  const out = !product.is_available
  const discounted = product.old_price != null && product.old_price > product.price

  return (
    <div className="group relative flex flex-col bg-background rounded-3xl border border-line shadow-card hover:shadow-lift transition-all duration-300 overflow-hidden">
      {/* Image */}
      <Link href={`/products/${product.slug}`} className="relative aspect-[4/5] w-full overflow-hidden bg-neutral-100">
        <Image
          src={product.image_url || FALLBACK_IMG}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          loading="lazy"
        />
        <div className="absolute top-3 right-3 flex flex-col items-end gap-2">
          {discounted && !out && (
            <span className="px-2.5 py-1 rounded-full bg-foreground text-background text-[11px] font-bold">
              خصم {Math.round(((product.old_price! - product.price) / product.old_price!) * 100)}٪
            </span>
          )}
          {product.is_featured && !out && (
            <span className="px-2.5 py-1 rounded-full bg-background/90 backdrop-blur text-foreground text-[11px] font-bold border border-line">
              مميّز
            </span>
          )}
        </div>
        {out && (
          <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="px-4 py-2 rounded-full bg-foreground text-background text-sm font-bold">
              نفدت الكمية
            </span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/products/${product.slug}`} className="min-w-0">
            <h3 className="font-bold text-foreground text-base leading-snug line-clamp-1 group-hover:underline">
              {product.name}
            </h3>
            <p className="text-[11px] text-muted mt-0.5">
              {product.category?.name || 'غير مصنّف'}
            </p>
          </Link>
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-lg font-black text-foreground">
            {formatPrice(product.price)}
          </span>
          {discounted && (
            <span className="text-sm text-muted line-through">
              {formatPrice(product.old_price)}
            </span>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-line">
          <AddToCartButton
            fullWidth
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
        </div>
      </div>
    </div>
  )
}
