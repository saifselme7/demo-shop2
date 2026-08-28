import { createClient } from '@/lib/supabase/server'
import type { StoreSetting, StoreSettingsMap } from '@/types/database'
import { DEFAULT_SETTINGS, normalizeSettings } from '@/lib/store-settings-defaults'

export { DEFAULT_SETTINGS, normalizeSettings }

/**
 * Server-side loader used by storefront server components.
 */
export async function getStoreSettings(): Promise<StoreSettingsMap> {
  const supabase = createClient()
  const { data } = await supabase.from('store_settings').select('*')
  return normalizeSettings(data as StoreSetting[] | null)
}

/**
 * Static/partial settings used when we only need a couple of values quickly.
 */
export async function getSetting(key: string): Promise<string | null> {
  const supabase = createClient()
  const { data } = await supabase
    .from('store_settings')
    .select('value')
    .eq('key', key)
    .maybeSingle()
  return data?.value ?? null
}
