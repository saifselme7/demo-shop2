import type { StoreSetting, StoreSettingsMap } from '@/types/database'

export const DEFAULT_SETTINGS: StoreSettingsMap = {
  store_name: 'سيف ستور',
  store_name_en: 'SAIF STORE',
  tagline: 'براند ملابس مصري عصري',
  contact_phone: '01040324811',
  whatsapp: '01040324811',
  email: 'hello@saifstore.com',
  address: 'القاهرة، مصر',
  payment_number: '01040324811',
  payment_number_vodafone: '01040324811',
  payment_number_instapay: '01040324811',
  delivery_fee: 0,
  free_delivery_threshold: 0,
  announcement: '',
  hero_title: 'ملابس تصنع حضورك',
  hero_subtitle: 'أحدث صيحات الموضة والجودة المصرية الخام في تشكيلة واحد.',
}

export function normalizeSettings(rows: StoreSetting[] | null): StoreSettingsMap {
  const result: StoreSettingsMap = { ...DEFAULT_SETTINGS }
  if (!rows) return result
  for (const row of rows) {
    if (row.key in result) {
      const numericKeys = ['delivery_fee', 'free_delivery_threshold']
      if (numericKeys.includes(row.key)) {
        result[row.key] = Number(row.value ?? 0) || 0
      } else {
        result[row.key] = row.value ?? ''
      }
    }
  }
  return result
}
