// src/api/product.api.ts
import { API_URL } from '../config/api'
import { supabase } from '../supabase'

/* ===============================
   1️⃣ upload รูป template
================================ */
export async function uploadTemplateImage(
  uri: string,
  barcode: string
): Promise<string> {
  const res = await fetch(uri)
  const blob = await res.blob()

  const filePath = `templates/${barcode}.jpg`

  const { error } = await supabase.storage
    .from('product-images')
    .upload(filePath, blob, {
      upsert: true,
      contentType: 'image/jpeg',
    })

  if (error) throw error

  const { data } = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath)

  return data.publicUrl
}

/* ===============================
   2️⃣ create product
================================ */
export async function createProduct(payload: {
  userId: string
  barcode: string
  templateId?: string | null
  name: string
  category: string
  storage: string
  locationId: string
  storageDate: Date
  expireDate: Date
  quantity: number
  imageUrl?: string | null

  // Personal
  notifyEnabled: boolean
  notifyBeforeDays?: number | null

  // Business (optional)
  price?: number | null
  store?: string | null
  lowStockEnabled?: boolean
  lowStockThreshold?: number | null
}) {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token

  if (!token) {
    throw new Error('Not authenticated')
  }

  const res = await fetch(`${API_URL}/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      ...payload,
      storageDate: payload.storageDate.toISOString(),
      expireDate: payload.expireDate.toISOString(),
    }),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message || 'Create product failed')
  }

  return res.json()
}

export async function getOverview(locationId: string) {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token

  if (!token) {
    throw new Error('Not authenticated')
  }

  const res = await fetch(`${API_URL}/products/overview/${locationId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message || 'Get overview failed')
  }

  return res.json()
}

/* ===============================
   3️⃣ search products
================================ */
export async function searchProducts(
  locationId: string,
  keyword: string
) {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token

  if (!token) {
    throw new Error('Not authenticated')
  }

  const res = await fetch(
    `${API_URL}/products/search?locationId=${locationId}&q=${encodeURIComponent(keyword)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message || 'Search products failed')
  }

  return res.json()
}