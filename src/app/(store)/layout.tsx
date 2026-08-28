import React from 'react'
import { StoreNavbar } from '@/components/store/Navbar'
import { StoreFooter } from '@/components/store/Footer'
import { getStoreSettings } from '@/lib/store-settings'

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const settings = await getStoreSettings()

  return (
    <div className="flex flex-col min-h-screen">
      <StoreNavbar
        storeName={String(settings.store_name)}
        storeNameEn={String(settings.store_name_en)}
      />
      <main className="flex-1">{children}</main>
      <StoreFooter
        storeName={String(settings.store_name)}
        storeNameEn={String(settings.store_name_en)}
        tagline={String(settings.tagline)}
        phone={String(settings.contact_phone)}
        whatsapp={String(settings.whatsapp)}
        email={String(settings.email)}
        address={String(settings.address)}
      />
    </div>
  )
}
