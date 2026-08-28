'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Shield, Store, LogOut, Sparkles } from 'lucide-react'

interface AdminHeaderProps {
  title: string
  description?: string
  actionButton?: React.ReactNode
}

export function AdminHeader({
  title,
  description,
  actionButton,
}: AdminHeaderProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <header className="bg-white border-b border-slate-200/80 px-6 py-5 sticky top-0 z-30">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>{title}</span>
          </h1>
          {description && (
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{description}</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {actionButton}
          
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors border border-slate-200/60"
          >
            <Store className="w-3.5 h-3.5 text-amber-600" />
            <span>View Live Store</span>
          </Link>
        </div>
      </div>
    </header>
  )
}
