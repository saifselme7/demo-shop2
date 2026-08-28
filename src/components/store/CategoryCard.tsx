import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Category } from '@/types/database'
import { ArrowRight } from 'lucide-react'

interface CategoryCardProps {
  category: Category
  productCount?: number
}

export function CategoryCard({ category, productCount }: CategoryCardProps) {
  const defaultImage =
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80'

  return (
    <Link
      href={`/categories/${category.slug}`}
      className="group relative flex flex-col justify-end overflow-hidden rounded-2xl aspect-[16/10] bg-slate-900 shadow-md hover:shadow-xl transition-all duration-300"
    >
      <Image
        src={category.image_url || defaultImage}
        alt={category.name}
        fill
        sizes="(max-width: 768px) 100vw, 33vw"
        className="object-cover group-hover:scale-110 group-hover:opacity-90 transition-all duration-500 opacity-70"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />

      <div className="relative p-5 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
              {category.name}
            </h3>
            {category.description && (
              <p className="text-xs text-slate-300 line-clamp-1 mt-0.5">
                {category.description}
              </p>
            )}
          </div>
          <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-amber-500 group-hover:text-slate-950 transition-all">
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  )
}
