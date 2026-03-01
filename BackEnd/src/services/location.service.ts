import { supabaseAdmin } from '../supabase'

export async function createLocation(userId: string, data: {
  name: string
  type: string
}) {
  const { data: location, error } = await supabaseAdmin
    .from('locations')
    .insert({
      name: data.name,
      type: data.type,
      owner_id: userId,
    })
    .select()
    .single()

  if (error) throw error

  return location
}

export async function deleteLocation(userId: string, locationId: string) {

  const { data: location } = await supabaseAdmin
    .from('locations')
    .select('owner_id')
    .eq('id', locationId)
    .single()

  if (!location || location.owner_id !== userId) {
    throw new Error('Only owner can delete this location')
  }

  // ลบ location อย่างเดียว
  const { error } = await supabaseAdmin
    .from('locations')
    .delete()
    .eq('id', locationId)

  if (error) throw error

  return { success: true }
}
export async function getMyLocations(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('locations')
    .select('id, name, type') // ⭐ ต้องมี type
    .eq('owner_id', userId)

  if (error) throw error
  return data
}