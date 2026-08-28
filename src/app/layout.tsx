import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SAIF STORE | Premium Specialty Store & Cafe',
  description: 'Explore our artisan coffees, gourmet smash burgers, delicious desserts, and refreshing beverages at SAIF STORE.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className="min-h-full flex flex-col antialiased bg-slate-50 text-slate-900 selection:bg-amber-100 selection:text-amber-900">
        {children}
      </body>
    </html>
  )
}
