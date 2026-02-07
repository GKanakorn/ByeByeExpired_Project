import { API_URL } from '../config/api'

export type Location = {
  id: string
  name: string
  type: "personal" | "business"
}

export async function createLocation(token: string, data: {
  id: string
  name: string
  type: 'personal' | 'business'
}) {
  const res = await fetch(`${API_URL}/api/locations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message)
  }

  return res.json()
}

export async function deleteLocation(token: string, locationId: string) {
  const res = await fetch(`${API_URL}/api/locations/${locationId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message || 'Delete location failed')
  }

  return res.json()
}

export async function getMyLocations(token: string): Promise<Location[]> {
  const res = await fetch(`${API_URL}/api/locations`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    throw new Error("Cannot load locations")
  }

  return res.json()
}
