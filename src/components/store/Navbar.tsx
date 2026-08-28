'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShoppingBag, Menu, X } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { cn } from '@/lib/utils'

interface StoreNavbarProps {
  storeName: string
  storeNameEn: string
}

export function StoreNavbar({ storeName, storeNameEn }: StoreNavbarProps) {
  const pathname = usePathname()
  const { itemCount, isLoaded } = useCart()
  const [isScrolled, setIsScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setMenuOpen(false), [pathname])

  const links = [
    { label: 'الرئيسية', href: '/' },
    { label: 'المنتجات', href: '/products' },
    { label: 'متابعة الطلب', href: '/orders/track' },
  ]

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full transition-all duration-300',
        isScrolled
          ? 'bg-background/90 backdrop-blur-xl border-b border-line shadow-sm'
          : 'bg-background border-b border-transparent'
      )}
    >
      <div className="container-x">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-foreground text-background flex items-center justify-center font-black text-lg tracking-tight group-hover:scale-105 transition-transform">
              س
            </div>
            <div className="leading-tight">
              <span className="text-xl font-black tracking-tight text-foreground block">
                {storeName}
              </span>
              <span className="hidden sm:block text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
                {storeNameEn} — Egyptian Clothing
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {links.map((link) => {
              const active =
                link.href === '/' ? pathname === '/' : pathname.startsWith(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm font-semibold transition-colors',
                    active
                      ? 'text-background bg-foreground'
                      : 'text-muted hover:text-foreground hover:bg-neutral-100'
                  )}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <Link
              href="/cart"
              className="relative inline-flex items-center justify-center p-2.5 rounded-full text-foreground hover:bg-neutral-100 transition-colors"
              aria-label="سلة التسوق"
            >
              <ShoppingBag className="w-6 h-6" />
              {isLoaded && itemCount > 0 && (
                <span className="absolute -top-0.5 -left-0.5 min-w-[20px] h-5 px-1 rounded-full bg-foreground text-background text-[11px] font-bold flex items-center justify-center ring-2 ring-background transition-transform duration-300 animate-in fade-in">
                  {itemCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="p-2.5 rounded-full text-foreground hover:bg-neutral-100 md:hidden transition-colors"
              aria-label="القائمة"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-line bg-background px-4 py-4 space-y-1 animate-in fade-in slide-in-from-top-1 duration-200">
          {links.map((link) => {
            const active =
              link.href === '/' ? pathname === '/' : pathname.startsWith(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'block px-4 py-3 rounded-xl text-sm font-semibold transition-colors',
                  active ? 'text-background bg-foreground' : 'text-foreground hover:bg-neutral-100'
                )}
              >
                {link.label}
              </Link>
            )
          })}
        </div>
      )}
    </header>
  )
}
