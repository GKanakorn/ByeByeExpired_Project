import { supabaseAdmin } from '../supabase'
import { CreateStorageInput } from '../types/storage'

export async function createStorage(data: CreateStorageInput) {
  const { error, data: result } = await supabaseAdmin
    .from('storages')
    .insert(data)
    .select()
    .single()

  if (error) throw error
  return result
}

export async function getStoragesByLocation(locationId: string) {
  const { data, error } = await supabaseAdmin
    .from('storages')
    .select(`
      id,
      name,
      icon,
      color,
      location_id,
      created_at,
      products(count)
    `)
    .eq('location_id', locationId)

  if (error) throw error

  // แปลง products(count) → item_count
  const storagesWithCount = (data || []).map((storage: any) => ({
    ...storage,
    item_count: storage.products?.[0]?.count ?? 0,
  }))

  return storagesWithCount
}