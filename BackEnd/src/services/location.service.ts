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

  await supabaseAdmin
    .from('location_members')
    .insert({
      user_id: userId,
      location_id: location.id,
      role: 'owner',
    })
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
    .from("location_members")
    .select(`
      role,
      locations:location_id (
        id,
        name,
        type,
        owner_id
      )
    `)
    .eq("user_id", userId)

  if (error) throw error
  if (!data) return []

  return data.map((row: any) => {
    const location = row.locations

    if (!location) {
      throw new Error("Location relation not found")
    }
    return {
      id: location.id,
      name: location.name,
      type: location.type,
      owner_id: location.owner_id,
      role: row.role,

    }

  })
}