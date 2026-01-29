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