import React from 'react'
import Link from 'next/link'
import { Store, Shield, Heart, MapPin, Phone, Mail } from 'lucide-react'

export function StoreFooter() {
  return (
    <footer className="mt-auto bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-bold">
                <Store className="w-5 h-5" />
              </div>
              <span className="text-xl font-black tracking-tight text-white">
                SAIF<span className="text-amber-400">STORE</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Real-time database-driven e-commerce showcase featuring specialty coffees, artisan burgers, handcrafted desserts, and cold beverages.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs text-amber-400 font-medium">
              <span>Prices in Egyptian Pounds (EGP)</span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Explore Store
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/" className="hover:text-amber-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-amber-400 transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/products?sort=newest" className="hover:text-amber-400 transition-colors">
                  New Arrivals
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Categories
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/categories/coffee-espresso" className="hover:text-amber-400 transition-colors">
                  Coffee & Espresso
                </Link>
              </li>
              <li>
                <Link href="/categories/burgers-sandwiches" className="hover:text-amber-400 transition-colors">
                  Burgers & Sandwiches
                </Link>
              </li>
              <li>
                <Link href="/categories/desserts-sweets" className="hover:text-amber-400 transition-colors">
                  Desserts & Sweets
                </Link>
              </li>
              <li>
                <Link href="/categories/cold-beverages" className="hover:text-amber-400 transition-colors">
                  Cold Beverages
                </Link>
              </li>
            </ul>
          </div>

          {/* Admin & System */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Management
            </h4>
            <p className="text-xs text-slate-400 mb-3">
              Store managers can update inventory, prices, and products in real-time.
            </p>
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-colors shadow-sm"
            >
              <Shield className="w-4 h-4" />
              <span>Admin Dashboard</span>
            </Link>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} SAIF STORE. Connected directly to Supabase PostgreSQL.</p>
          <p className="flex items-center gap-1">
            Built with Next.js, Supabase & Tailwind CSS
          </p>
        </div>
      </div>
    </footer>
  )
}
