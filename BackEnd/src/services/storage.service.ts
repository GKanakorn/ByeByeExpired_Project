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
    .select('id, name, icon, color, item_count')
    .eq('location_id', locationId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data
}