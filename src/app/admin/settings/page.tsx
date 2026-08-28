import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { SettingsManager } from '@/components/admin/SettingsManager'
import { StoreSetting } from '@/types/database'

export const dynamic = 'force-dynamic'

export default async function AdminSettingsPage() {
  const supabase = createClient()
  const { data } = await supabase.from('store_settings').select('*').order('created_at', { ascending: true })
  const settings = (data as StoreSetting[]) || []

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="إعدادات المتجر"
        description="عدّل اسم المتجر، أرقام التواصل، طرق الدفع، ورسوم التوصيل بدون تعديل الكود."
      />
      <div className="p-6 sm:p-8 max-w-7xl w-full">
        <SettingsManager initialSettings={settings} />
      </div>
    </div>
  )
}
