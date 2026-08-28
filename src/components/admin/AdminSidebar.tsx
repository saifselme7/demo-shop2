'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard,
  Package,
  Layers,
  Store,
  LogOut,
  PlusCircle,
  ClipboardList,
  Settings,
  ExternalLink,
} from 'lucide-react'

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/admin/login')
      router.refresh()
    } catch (err) {
      console.error('Sign out error:', err)
    }
  }

  const navItems = [
    { label: 'لوحة التحكم', href: '/admin', icon: LayoutDashboard, exact: true },
    { label: 'المنتجات', href: '/admin/products', icon: Package, exact: false },
    { label: 'التصنيفات', href: '/admin/categories', icon: Layers, exact: false },
    { label: 'الطلبات', href: '/admin/orders', icon: ClipboardList, exact: false },
    { label: 'إعدادات المتجر', href: '/admin/settings', icon: Settings, exact: false },
  ]

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 min-h-screen sticky top-0 h-screen overflow-y-auto">
      {/* Brand */}
      <div className="p-6 border-b border-slate-800">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/20">
            س
          </div>
          <div>
            <h1 className="font-extrabold text-white text-base tracking-tight leading-none">
              سيف ستور
            </h1>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-400">
              لوحة الإدارة
            </span>
          </div>
        </Link>
      </div>

      {/* Quick add */}
      <div className="px-4 pt-5 pb-2">
        <Link
          href="/admin/products/new"
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all shadow-md shadow-amber-500/20"
        >
          <PlusCircle className="w-4 h-4" />
          <span>إضافة منتج</span>
        </Link>
      </div>

      {/* Nav */}
      <div className="flex-1 px-4 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          إدارة المتجر
        </div>
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </Link>
          )
        })}

        <div className="pt-6 px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          المتجر
        </div>
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
        >
          <span className="flex items-center gap-3">
            <Store className="w-4 h-4 text-slate-400" />
            <span>المتجر العام</span>
          </span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
        </Link>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800">
        <div className="px-3 py-2 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-between">
          <div className="truncate">
            <p className="text-xs font-semibold text-white truncate">مدير المتجر</p>
            <p className="text-[11px] text-amber-400">متصل بقاعدة البيانات</p>
          </div>
          <button
            onClick={handleSignOut}
            title="تسجيل الخروج"
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700/60 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
