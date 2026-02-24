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
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('expiration_date')
    .eq('owner_id', userId)

  if (error) throw error

  const today = new Date()
  const threeDaysLater = new Date()
  threeDaysLater.setDate(today.getDate() + 3)

  let total = data.length
  let near = 0
  let expired = 0

  data.forEach((item: any) => {
    const exp = new Date(item.expiration_date)

    if (exp < today) expired++
    else if (exp >= today && exp <= threeDaysLater) near++
  })

  return {
    total,
    near,
    expired,
  }
}