import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Truck, ShieldCheck, CreditCard } from 'lucide-react'

interface HeroBannerProps {
  title: string
  subtitle: string
}

export function HeroBanner({ title, subtitle }: HeroBannerProps) {
  return (
    <section className="relative overflow-hidden bg-foreground text-background">
      <div className="container-x py-16 sm:py-24 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Copy — appears immediately, no reveal wrapper */}
          <div className="space-y-7">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/20 text-xs font-semibold tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-background" />
              براند ملابس مصري — طُرز جديدة كل موسم
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.15] tracking-tight text-balance">
              {title}
              <span className="block mt-2 text-neutral-400">بجودة تُحسب لك.</span>
            </h1>

            <p className="text-neutral-300 text-base sm:text-lg leading-relaxed max-w-lg">
              {subtitle}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/products"
                className="btn-press inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-background text-foreground font-bold text-sm hover:bg-neutral-200 shadow-lg"
              >
                تسوّق المجموعة
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <Link
                href="/orders/track"
                className="btn-press inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-white/25 text-background font-bold text-sm hover:bg-white/10"
              >
                تتبع طلبك
              </Link>
            </div>

            {/* Trust highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6">
              <div className="flex items-center gap-2.5 text-xs text-neutral-300">
                <Truck className="w-5 h-5 text-neutral-400" />
                توصيل سريع لجميع المحافظات
              </div>
              <div className="flex items-center gap-2.5 text-xs text-neutral-300">
                <ShieldCheck className="w-5 h-5 text-neutral-400" />
                خامات مضمونة
              </div>
              <div className="flex items-center gap-2.5 text-xs text-neutral-300">
                <CreditCard className="w-5 h-5 text-neutral-400" />
                فودافون كاش وانستاباي
              </div>
            </div>
          </div>

          {/* Hero image */}
          <div className="relative hidden lg:block">
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-neutral-800 shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80"
                alt="تشكيلة ملابس عصرية"
                fill
                priority
                sizes="(max-width: 1024px) 0vw, 50vw"
                className="object-cover"
              />
            </div>
            {/* floating card */}
            <div className="absolute -bottom-5 -left-5 bg-background text-foreground rounded-2xl shadow-2xl px-5 py-4 max-w-[240px]">
              <p className="text-2xl font-black">+٨ تصنيفات</p>
              <p className="text-xs text-muted">تيشيرتات · هوديز · بناطيل وأكثر</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
