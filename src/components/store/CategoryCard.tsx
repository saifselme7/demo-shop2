import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Category } from '@/types/database'
import { ArrowLeft } from 'lucide-react'

const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80'

export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      href={`/categories/${category.slug}`}
      className="group relative flex flex-col justify-end overflow-hidden rounded-3xl aspect-[16/10] bg-foreground shadow-card hover:shadow-lift transition-all duration-300"
    >
      <Image
        src={category.image_url || FALLBACK_IMG}
        alt={category.name}
        fill
        sizes="(max-width: 768px) 100vw, 25vw"
        className="object-cover opacity-80 group-hover:scale-110 group-hover:opacity-70 transition-all duration-700"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

      <div className="relative p-5 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-white group-hover:text-neutral-200 transition-colors">
              {category.name}
            </h3>
            {category.description && (
              <p className="text-xs text-neutral-300 line-clamp-1 mt-0.5">
                {category.description}
              </p>
            )}
          </div>
          <div className="w-9 h-9 rounded-full bg-white/15 backdrop-blur flex items-center justify-center text-white group-hover:bg-white group-hover:text-foreground transition-colors shrink-0">
            <ArrowLeft className="w-4 h-4" />
          </div>
        </div>
      </div>
    </Link>
  )
}
