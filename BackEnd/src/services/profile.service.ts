// src/services/profile.service.ts
import { supabaseAdmin } from '../supabase'

export async function getProfile(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name, avatar_url')
    .eq('id', userId)
    .single()

  if (error) throw error
  return data
}

export async function updateProfile(
  userId: string,
  data: { full_name?: string; avatar_url?: string }
) {
  const { data: result, error } = await supabaseAdmin
    .from('profiles')
    .update(data)
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return result
}

export async function getProfileStats(userId: string) {
  // Include locations the user owns + locations the user joined as member.
  const { data: ownedLocations, error: ownedError } = await supabaseAdmin
    .from('locations')
    .select('id')
    .eq('owner_id', userId)

  if (ownedError) throw ownedError

  const { data: membershipRows, error: membershipError } = await supabaseAdmin
    .from('location_members')
    .select('location_id')
    .eq('user_id', userId)

  if (membershipError) throw membershipError

  const accessibleLocationIds = [
    ...(ownedLocations?.map((row: any) => row.id) || []),
    ...(membershipRows?.map((row: any) => row.location_id) || []),
  ]

  const uniqueLocationIds = [...new Set(accessibleLocationIds)]

  if (uniqueLocationIds.length === 0) {
    return {
      total: 0,
      near: 0,
      expired: 0,
    }
  }

  const { data, error } = await supabaseAdmin
    .from('products')
    .select('expiration_date')
    .in('location_id', uniqueLocationIds)

  if (error) throw error

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let near = 0
  let expired = 0

  ;(data || []).forEach((item: any) => {
    if (!item.expiration_date) return

    const exp = new Date(item.expiration_date)
    exp.setHours(0, 0, 0, 0)

    const diff = Math.floor(
      (exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (diff < 0) {
      expired++
    } else if (diff <= 7) {
      near++
    }
  })

  return {
    total: data.length,
    near,
    expired,
  }
}