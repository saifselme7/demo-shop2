import React from 'react'
import Link from 'next/link'
import { ArrowRight, Sparkles, ShieldCheck, Zap } from 'lucide-react'

export function HeroBanner() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-amber-50/70 via-slate-50 to-white py-16 sm:py-24 border-b border-slate-200/60">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.amber.100),transparent)] opacity-60" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100/80 border border-amber-200 text-amber-900 text-xs font-semibold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Real-time Supabase Database Integration</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-tight">
            Crafted for Taste, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800">
              Powered by Live Data.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Welcome to <span className="font-semibold text-slate-900">SAIF STORE</span>. Every product, price, category, and availability status updates instantly when modified in the store manager dashboard.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-amber-600/25 transition-all hover:scale-[1.02]"
            >
              <span>Explore All Products</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/admin"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm sm:text-base border border-slate-200 shadow-sm transition-all hover:scale-[1.02]"
            >
              <Zap className="w-4 h-4 text-amber-600" />
              <span>Open Admin Dashboard</span>
            </Link>
          </div>

          {/* Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-8 max-w-2xl mx-auto text-left">
            <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium text-slate-700">Row Level Security Protected</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium text-slate-700">Supabase Storage Image Bucket</span>
            </div>

            <div className="col-span-2 sm:col-span-1 p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium text-slate-700">Instant Admin Synced Updates</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
