import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Product } from '@/types/database'
import { formatPrice } from '@/lib/utils'
import { ArrowRight, CheckCircle2, XCircle } from 'lucide-react'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const defaultImage =
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80'

  return (
    <div className="group flex flex-col bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-amber-300 transition-all duration-300 overflow-hidden">
      {/* Image container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
        <Image
          src={product.image_url || defaultImage}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Availability Badge */}
        <div className="absolute top-3 left-3">
          {product.is_available ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/90 text-white backdrop-blur-md shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Available
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-600/90 text-white backdrop-blur-md shadow-sm">
              <XCircle className="w-3.5 h-3.5" />
              Out of Stock
            </span>
          )}
        </div>

        {/* Category Tag */}
        {product.category && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-slate-900/75 text-white backdrop-blur-md">
              {product.category.name}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        <h3 className="font-bold text-slate-900 text-lg group-hover:text-amber-600 transition-colors line-clamp-1">
          {product.name}
        </h3>

        <p className="mt-1.5 text-sm text-slate-500 line-clamp-2 leading-relaxed flex-1">
          {product.description || 'Artisan handcrafted recipe made fresh to order.'}
        </p>

        {/* Price & Action */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium block">Price</span>
            <span className="text-xl font-extrabold text-slate-900 tracking-tight">
              {formatPrice(product.price)}
            </span>
          </div>

          <Link
            href={`/products/${product.slug}`}
            className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-amber-50 text-amber-800 hover:bg-amber-100 group-hover:bg-amber-600 group-hover:text-white transition-all shadow-sm"
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  )
}
