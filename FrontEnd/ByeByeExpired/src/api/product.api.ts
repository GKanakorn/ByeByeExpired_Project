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
  supplierId?: string | null
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

// Get all products, optionally by locationId
export async function getProducts(locationId: string) {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token

  if (!token) throw new Error('Not authenticated')

  const res = await fetch(
    `${API_URL}/products?locationId=${locationId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message || 'Get products failed')
  }

  return res.json()
}

/* ===============================
   4️⃣ get product by id
================================ */
export async function getProductById(productId: string) {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token

  if (!token) throw new Error('Not authenticated')

  const res = await fetch(
    `${API_URL}/products/${productId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message || 'Get product failed')
  }

  return res.json()
}

/* ===============================
   4️⃣ get expired products
================================ */
export async function getExpiredProducts(locationId: string) {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token

  if (!token) throw new Error('Not authenticated')

  const res = await fetch(
    `${API_URL}/products/expired?locationId=${locationId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message || 'Get expired products failed')
  }

  return res.json()
}

/* ===============================
   5️⃣ get nearly expired products
================================ */
export async function getNearlyExpiredProducts(locationId: string) {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token

  if (!token) throw new Error('Not authenticated')

  const res = await fetch(
    `${API_URL}/products/nearly-expired?locationId=${locationId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message || 'Get nearly expired products failed')
  }

  return res.json()
}

export const updateProduct = async (
  productId: string,
  payload: any
) => {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token

  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_URL}/products/${productId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    throw new Error('Update product failed')
  }

  return res.json()
}

export const deleteProduct = async (productId: string) => {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token

  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${API_URL}/products/${productId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    throw new Error('Delete product failed')
  }

  return res.json()
}

export async function getDeletedHistory(token: string) {
  const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/products/history/deleted`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const text = await res.text();

  if (!res.ok) {
    throw new Error(`Fetch history failed: ${res.status}`);
  }

  return JSON.parse(text);
}