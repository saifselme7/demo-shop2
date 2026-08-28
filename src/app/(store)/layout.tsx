import React from 'react'
import { StoreNavbar } from '@/components/store/Navbar'
import { StoreFooter } from '@/components/store/Footer'

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <StoreNavbar />
      <main className="flex-1">{children}</main>
      <StoreFooter />
    </div>
  )
}
