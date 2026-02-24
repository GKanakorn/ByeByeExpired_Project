// src/api/profile.api.ts
import { API_URL } from '../config/api'
import { supabase } from '../supabase'

export async function getProfile(token: string) {
  const res = await fetch(`${API_URL}/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const text = await res.text()
  console.log("GET /profile status:", res.status)
  console.log("GET /profile response:", text)

  if (!res.ok) {
    throw new Error(`Fetch profile failed: ${res.status}`)
  }

  return JSON.parse(text)
}

export async function updateProfile(
  token: string,
  data: { full_name?: string; avatar_url?: string }
) {
  const res = await fetch(`${API_URL}/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })

  const text = await res.text()
  console.log("PUT /profile status:", res.status)
  console.log("PUT /profile response:", text)

  if (!res.ok) {
    throw new Error(`Update profile failed: ${res.status}`)
  }

  return JSON.parse(text)
}

export async function getProfileStats(token: string) {
  const res = await fetch(`${API_URL}/profile/stats`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const text = await res.text()
  console.log("GET /profile/stats status:", res.status)
  console.log("GET /profile/stats response:", text)

  if (!res.ok) {
    throw new Error(`Fetch stats failed: ${res.status}`)
  }

  return JSON.parse(text)
}