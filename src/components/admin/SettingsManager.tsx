'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { StoreSetting } from '@/types/database'
import { DEFAULT_SETTINGS } from '@/lib/store-settings-defaults'
import { Loader2, Check, AlertCircle, Save } from 'lucide-react'

const GROUPS: { title: string; keys: string[] }[] = [
  { title: 'المتجر', keys: ['store_name', 'store_name_en', 'tagline', 'announcement', 'address'] },
  { title: 'التواصل', keys: ['contact_phone', 'whatsapp', 'email'] },
  {
    title: 'الدفع والتوصيل',
    keys: ['payment_number', 'payment_number_vodafone', 'payment_number_instapay', 'delivery_fee', 'free_delivery_threshold'],
  },
  { title: 'الصفحة الرئيسية', keys: ['hero_title', 'hero_subtitle'] },
]

export function SettingsManager({ initialSettings }: { initialSettings: StoreSetting[] }) {
  const supabase = createClient()
  const router = useRouter()

  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {}
    for (const key of Object.keys(DEFAULT_SETTINGS)) {
      const row = initialSettings.find((s) => s.key === key)
      init[key] = row?.value != null ? row.value : String(DEFAULT_SETTINGS[key] ?? '')
    }
    return init
  })

  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  const handleSave = async () => {
    setSaving(true)
    setFeedback(null)
    try {
      for (const key of Object.keys(values)) {
        const { error } = await supabase
          .from('store_settings')
          .upsert({ key, value: values[key], label: key }, { onConflict: 'key' })
        if (error) throw error
      }
      setFeedback({ type: 'success', msg: 'تم حفظ الإعدادات بنجاح! المتجر محدّث الآن.' })
      router.refresh()
    } catch (err: any) {
      console.error(err)
      setFeedback({ type: 'error', msg: err.message || 'فشل حفظ الإعدادات.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {feedback && (
        <div
          className={`p-4 rounded-xl border text-sm flex items-center gap-3 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {feedback.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{feedback.msg}</span>
        </div>
      )}

      <div className="space-y-6">
        {GROUPS.map((group) => (
          <div key={group.title} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3">{group.title}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {group.keys.map((key) => (
                <div key={key} className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                    {key.replace(/_/g, ' ')}
                  </label>
                  <input
                    type="text"
                    value={values[key] ?? ''}
                    onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm bg-slate-50/50"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm transition-all shadow-sm disabled:opacity-50"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {saving ? 'جارٍ الحفظ...' : 'حفظ الإعدادات'}
      </button>
    </div>
  )
}
