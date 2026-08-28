import React from 'react'
import Link from 'next/link'
import { getStoreSettings } from '@/lib/store-settings'
import { CheckoutForm } from '@/components/store/CheckoutForm'
import { ArrowRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function CheckoutPage() {
  const settings = await getStoreSettings()

  return (
    <div className="container-x py-10 sm:py-14">
      <div className="mb-8">
        <Link
          href="/cart"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-foreground transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة إلى السلة</span>
        </Link>
        <h1 className="text-3xl font-black tracking-tight mt-3">إتمام الطلب</h1>
        <p className="text-muted mt-1 text-sm">
          أدخل بياناتك واختر طريقة الدفع ثم ارفع إثبات التحويل.
        </p>
      </div>

      <CheckoutForm
        paymentNumber={String(settings.payment_number)}
        vodafoneNumber={String(settings.payment_number_vodafone)}
        instapayNumber={String(settings.payment_number_instapay)}
        deliveryFee={Number(settings.delivery_fee) || 0}
      />
    </div>
  )
}
