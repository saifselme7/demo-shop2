import React from 'react'
import Link from 'next/link'
import { Phone, Mail, MapPin, Instagram, Facebook, ShoppingBag } from 'lucide-react'

interface StoreFooterProps {
  storeName: string
  storeNameEn: string
  tagline: string
  phone: string
  whatsapp: string
  email: string
  address: string
}

export function StoreFooter({
  storeName,
  storeNameEn,
  tagline,
  phone,
  whatsapp,
  email,
  address,
}: StoreFooterProps) {
  return (
    <footer className="mt-auto bg-foreground text-neutral-300">
      <div className="container-x py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-background text-foreground flex items-center justify-center font-black text-lg">
                س
              </div>
              <span className="text-xl font-black text-white">{storeName}</span>
            </div>
            <p className="text-sm text-neutral-400 leading-relaxed">
              {tagline}. تصميمات عصرية وخامات ممتازة بأسعار منافسة، توصيل لجميع
              محافظات مصر.
            </p>
            <div className="flex items-center gap-2">
              <a
                href={`https://wa.me/2${whatsapp.replace(/^0/, '')}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-background text-foreground text-xs font-bold hover:opacity-90 transition-opacity"
              >
                واتساب
              </a>
              <span className="text-xs text-neutral-500">اطلب عبر واتساب مباشرة</span>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              المتجر
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  الرئيسية
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-white transition-colors">
                  كل المنتجات
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-white transition-colors">
                  سلة التسوق
                </Link>
              </li>
              <li>
                <Link href="/orders/track" className="hover:text-white transition-colors">
                  تتبع الطلب
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              تواصل معنا
            </h4>
            <ul className="space-y-3 text-sm text-neutral-400">
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-neutral-500" />
                <span dir="ltr">{phone}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-neutral-500" />
                <span dir="ltr">{email}</span>
              </li>
              <li className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-neutral-500" />
                <span>{address}</span>
              </li>
            </ul>
          </div>

          {/* Payments */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              طرق الدفع
            </h4>
            <div className="flex flex-col gap-2 text-sm text-neutral-400">
              <span>فودافون كاش</span>
              <span>انستاباي</span>
              <span className="text-xs text-neutral-500 mt-1">
                ادفع إلكترونياً وأرفق إثبات التحويل عند إتمام الطلب.
              </span>
              <a
                href="/products"
                className="inline-flex items-center gap-2 mt-2 px-4 py-2.5 rounded-full bg-white text-foreground font-bold text-xs hover:opacity-90 transition-opacity"
              >
                <ShoppingBag className="w-4 h-4" />
                تسوق الآن
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 gap-4">
          <p>
            © {new Date().getFullYear()} {storeName} ({storeNameEn}). جميع الحقوق محفوظة.
          </p>
          <p className="flex items-center gap-1">صُنع بحب في مصر 🇪🇬</p>
        </div>
      </div>
    </footer>
  )
}
