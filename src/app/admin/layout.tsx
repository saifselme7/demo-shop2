'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isLoginPage = pathname === '/admin/login'

  if (isLoginPage) {
    return <main className="min-h-screen bg-slate-900">{children}</main>
  }

  return (
    <div className="flex min-h-screen bg-slate-100/70">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {children}
      </div>
    </div>
  )
}
