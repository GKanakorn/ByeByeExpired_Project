import { API_URL } from '../config/api'

export async function createStorage(
  token: string,
  locationId: string,
  payload: {
    name: string
    icon: string
    color: string
  }
) {
  const res = await fetch(
    `${API_URL}/api/locations/${locationId}/storages`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    }
  )

  const text = await res.text() // ✅ อ่านครั้งเดียว

  let data: any
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = text
  }

  if (!res.ok) {
    throw new Error(data?.message || data || 'Create storage failed')
  }

  return data
}

export async function getStoragesByLocation(
  token: string,
  locationId: string
) {
  const res = await fetch(
    `${API_URL}/api/locations/${locationId}/storages`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  const data = await res.json()
  if (!res.ok) {
    throw new Error(data?.message || "Fetch storages failed")
  }

  return data
}