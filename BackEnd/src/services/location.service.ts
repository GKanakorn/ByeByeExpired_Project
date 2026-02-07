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

  // auto add owner as admin
  await supabaseAdmin.from('location_members').insert({
    location_id: location.id,
    user_id: userId,
    role: 'admin',
  })

  return location
}

export async function deleteLocation(
  userId: string,
  locationId: string
) {
  // 1. ลบสมาชิกก่อน (กัน FK error)
  await supabaseAdmin
    .from('location_members')
    .delete()
    .eq('location_id', locationId)

  // 2. ลบ location (เฉพาะ owner)
  const { error } = await supabaseAdmin
    .from('locations')
    .delete()
    .eq('id', locationId)
    .eq('owner_id', userId)

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