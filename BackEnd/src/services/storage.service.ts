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