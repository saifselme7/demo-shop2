import type { Metadata, Viewport } from 'next'
import './globals.css'
import { CartProvider } from '@/context/CartContext'

export const metadata: Metadata = {
  title: {
    default: 'سيف ستور | براند ملابس مصري عصري',
    template: '%s | سيف ستور',
  },
  description:
    'سيف ستور — متجر ملابس مصري عصري. تيشيرتات، هوديز، بناطيل، قمصان، جاكيتات ومزيد من أحدث صيحات الموضة. توصيل سريع لجميع محافظات مصر.',
  keywords: [
    'ملابس مصر',
    'تيشيرتات',
    'هوديز',
    'موضة',
    'سيف ستور',
    'تسوق أونلاين مصر',
  ],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0a0a0a',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl" className="h-full scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col antialiased bg-offwhite text-foreground selection:bg-foreground selection:text-offwhite">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  )
}
