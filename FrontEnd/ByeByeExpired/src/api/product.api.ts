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
  notifyEnabled: boolean
  notifyBeforeDays?: number | null
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