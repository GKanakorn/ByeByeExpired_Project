import { supabaseAdmin } from '../supabase'

const DEFAULT_STORAGES_FOR_NEW_LOCATION = [
  { name: 'Freezer', icon: 'freezer', color: '#3498DB' },
  { name: 'Fridge', icon: 'fridge', color: '#FFB6C1' },
  { name: 'Dry food', icon: 'pantry', color: '#E67E22' },
]

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

  if (error || !location) throw error ?? new Error('Failed to create location')

  const { error: memberError } = await supabaseAdmin
    .from('location_members')
    .insert({
      user_id: userId,
      location_id: location.id,
      role: 'owner',
    })

  if (memberError) throw memberError

  const storagePayload = DEFAULT_STORAGES_FOR_NEW_LOCATION.map(storage => ({
    name: storage.name,
    icon: storage.icon,
    color: storage.color,
    location_id: location.id,
  }))

  const { error: storageError } = await supabaseAdmin
    .from('storages')
    .insert(storagePayload)

  if (storageError) throw storageError

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

  const { count: productCount, error: productCountError } = await supabaseAdmin
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('location_id', locationId)

  if (productCountError) throw productCountError

  if ((productCount ?? 0) > 0) {
    throw new Error('This location still has products. Please delete all products first before deleting the location.')
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