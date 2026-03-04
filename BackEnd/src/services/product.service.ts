// services/product.service.ts
import { supabaseAdmin } from '../supabase'

export async function createProduct(userId: string, payload: any) {
  const {
    barcode,
    name,
    category,
    storage,
    imageUrl,
    locationId,
    storageDate,
    expireDate,
    notifyEnabled,
    notifyBeforeDays,
    quantity,

    price,
    lowStockEnabled,
    supplierId,
    lowStockThreshold,
  } = payload

  // ===============================
  // 0️⃣ คำนวณวันแจ้งเตือน
  // ===============================
  let notifyDate: string | null = null

  if (
    notifyEnabled &&
    notifyBeforeDays !== undefined &&
    notifyBeforeDays !== null &&
    expireDate
  ) {
    const d = new Date(expireDate)
    d.setDate(d.getDate() - Number(notifyBeforeDays))
    notifyDate = d.toISOString()
  }

  // ===============================
  // 1️⃣ หา template จาก barcode (GLOBAL)
  // ===============================
  let existingTemplate = null

  if (barcode) {
    const { data } = await supabaseAdmin
      .from('product_templates')
      .select('*')
      .eq('barcode', barcode)
      .maybeSingle()

    existingTemplate = data
  }

  let templateId = existingTemplate?.id ?? null

  // ===============================
  // 2️⃣ ถ้าไม่มี template → สร้างใหม่
  // ===============================
  if (!existingTemplate) {
    const { data: newTemplate, error } = await supabaseAdmin
      .from('product_templates')
      .insert({
        barcode: barcode || `MANUAL_${Date.now()}`,
        name,
        category,
        default_storage: storage,
        image_url: imageUrl,
      })
      .select()
      .single()

    if (error) throw error
    templateId = newTemplate.id
  }

  // ===============================
  // 3️⃣ ถ้ามี template → เติมเฉพาะช่องที่ยัง NULL
  // ===============================
  if (existingTemplate) {
    await supabaseAdmin
      .from('product_templates')
      .update({
        name: existingTemplate.name ?? name,
        category: existingTemplate.category ?? category,
        default_storage:
          existingTemplate.default_storage ?? storage,
        image_url:
          existingTemplate.image_url ?? imageUrl,
      })
      .eq('id', existingTemplate.id)
  }

  // ===============================
  // 4️⃣ สร้าง product (ของ user)
  // ===============================
  const { data: product, error: productError } =
    await supabaseAdmin
      .from('products')
      .insert({
        owner_id: userId,
        barcode,
        template_id: templateId,
        name,
        category,
        location_id: locationId,
        storage_id: storage,
        storage_date: storageDate,
        expiration_date: expireDate,
        notify_enabled: notifyEnabled,
        notify_before_days: notifyBeforeDays,
        notify_at: notifyDate,
        quantity,

        // 🔥 Business fields
        price: price ?? null,
        low_stock_enabled: lowStockEnabled ?? false,
        supplier_id: supplierId ?? null,
        low_stock_threshold: lowStockThreshold ?? null,
      })
      .select()
      .single()

  if (productError) throw productError

  return product
}

export async function getOverview(userId: string, locationId: string) {
  const { data: items, error } = await supabaseAdmin
    .from('products')
    .select(`
      id,
      name,
      category,
      expiration_date,
      location_id,
      owner_id,
      product_templates (
        name,
        image_url,
        category
      )
    `)
    .eq('location_id', locationId)

  if (error) throw error

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const nearlyExpired: any[] = []
  const expired: any[] = []

    ; (items || []).forEach((item: any) => {
      if (!item.expiration_date) return

      const exp = new Date(item.expiration_date)
      exp.setHours(0, 0, 0, 0)

      const diff = Math.floor(
        (exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      )

      if (diff < 0) {
        expired.push(item)
      } else if (diff <= 7) {
        nearlyExpired.push(item)
      }
    })

  return {
    nearlyExpired,
    expired,
  }
}

export async function deleteProductQuantity(
  userId: string,
  productId: string,
  quantityToDelete: number
) {
  // location-role middleware already guarantees this user may edit the product
  const { data: product, error } = await supabaseAdmin
    .from('products')
    .select(`
      id,
      name,
      quantity,
      owner_id,
      location_id,
      template_id,
      product_templates (
        image_url
      )
    `)
    .eq('id', productId)
    .single()

  if (error || !product) {
    throw new Error('Product not found')
  }

  if (quantityToDelete <= 0) {
    throw new Error('Invalid quantiaty')
  }

  const template = product.product_templates as
    | { image_url: string | null }
    | { image_url: string | null }[]
    | null

  const imageUrl = Array.isArray(template)
    ? template[0]?.image_url ?? null
    : template?.image_url ?? null

  // ✅ บันทึก history พร้อมรูป
  await supabaseAdmin
    .from('product_delete_history')
    .insert({
      product_id: product.id,
      product_name: product.name,
      deleted_quantity: quantityToDelete,
      deleted_by: userId,
      location_id: product.location_id,
      photo_url: imageUrl, // 🔥 เก็บรูป
    })

  // ลบหมด
  if (product.quantity <= quantityToDelete) {
    await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', productId)

    return { deleted: true }
  }

  // ยังเหลือ
  await supabaseAdmin
    .from('products')
    .update({
      quantity: product.quantity - quantityToDelete,
    })
    .eq('id', productId)

  return { deleted: false }
}

export async function getProductsByLocation(
  userId: string,
  locationId: string
) {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select(`
      *,
      product_templates (
        name,
        image_url,
        category
      )
    `)
    .eq('location_id', locationId)
    .order('expiration_date', { ascending: true })

  if (error) throw error

  return data
}

export async function getProductsByBarcode(
  userId: string,
  barcode: string,
  locationId: string
) {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select(`
      *,
      product_templates (
        name,
        image_url
      )
    `)
    .eq('barcode', barcode)
    .eq('location_id', locationId)
    .order('expiration_date', { ascending: true })

  if (error) throw error

  return data
}
export async function searchProducts(
  userId: string,
  locationId: string,
  keyword: string
) {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select(`
      id,
      name,
      category,
      quantity,
      expiration_date,
      storage_id,
      location_id,
      product_templates!inner (
        id,
        name,
        image_url,
        barcode,
        category
      )
    `)
    .eq('location_id', locationId)
    .ilike('product_templates.name', `%${keyword}%`)
    .order('expiration_date', { ascending: true })

  if (error) throw error

  return data || []
}
export async function getProductById(
  userId: string,
  productId: string
) {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select(`
  id,
  name,
  category,
  quantity,
  storage_date,
  expiration_date,
  storage_id,
  notify_enabled,
  notify_before_days,
  low_stock_enabled,
  low_stock_threshold,
  price,
  supplier_id,
  suppliers (
    id,
    company_name
  ),
  product_templates (
    id,
    name,
    image_url,
    category,
    barcode
  )
`)
    .eq('id', productId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  return data
}

export async function getExpiredProducts(
  userId: string,
  locationId: string
) {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select(`
      *,
      product_templates (
        id,
        name,
        image_url,
        category
      )
    `)
    .eq('location_id', locationId)
    .order('expiration_date', { ascending: true })

  if (error) throw error

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const expired = (data || []).filter((item: any) => {
    if (!item.expiration_date) return false

    const exp = new Date(item.expiration_date)
    exp.setHours(0, 0, 0, 0)

    return exp < today
  })

  return expired
}

export async function getNearlyExpiredProducts(
  userId: string,
  locationId: string
) {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select(`
      *,
      product_templates (
        name,
        image_url,
        category
      )
    `)
    .eq('location_id', locationId)
    .order('expiration_date', { ascending: true })

  if (error) throw error

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const nearlyExpired = (data || []).filter((item: any) => {
    if (!item.expiration_date) return false

    const exp = new Date(item.expiration_date)
    exp.setHours(0, 0, 0, 0)

    const diff = Math.floor(
      (exp.getTime() - today.getTime()) /
      (1000 * 60 * 60 * 24)
    )

    return diff >= 0 && diff <= 7
  })

  return nearlyExpired
}
export async function updateProduct(
  userId: string,
  productId: string,
  payload: any
) {
  const {
    name,
    category,
    storage,
    locationId,
    storageDate,
    expireDate,
    quantity,
    notifyEnabled,
    notifyBeforeDays,
    price,
    supplierId,
    lowStockEnabled,
    lowStockThreshold,
  } = payload

  // location-role middleware already guarantees this user may edit the product
  const { data, error } = await supabaseAdmin
    .from('products')
    .update({
      name,
      category,
      storage_id: storage,
      location_id: locationId,
      storage_date: storageDate,
      expiration_date: expireDate,
      quantity,
      notify_enabled: notifyEnabled,
      notify_before_days: notifyBeforeDays,
      price: price ?? null,
      supplier_id: supplierId ?? null,
      low_stock_enabled: lowStockEnabled ?? false,
      low_stock_threshold: lowStockThreshold ?? null,
    })
    .eq('id', productId)
    .select()
    .single()

  if (error) throw error

  return data
}

export async function deleteProduct(
  userId: string,
  productId: string
) {
  // fetch product regardless of owner; authorization checked by middleware
  const { data: product, error } = await supabaseAdmin
    .from('products')
    .select(`
      id,
      name,
      quantity,
      location_id,
      product_templates (
        image_url
      )
    `)
    .eq('id', productId)
    .single()

  if (error || !product) {
    throw new Error('Product not found')
  }

  const template = product.product_templates as
    | { image_url: string | null }
    | { image_url: string | null }[]
    | null

  const imageUrl = Array.isArray(template)
    ? template[0]?.image_url ?? null
    : template?.image_url ?? null

  // ✅ บันทึก history พร้อมรูป
  await supabaseAdmin
    .from('product_delete_history')
    .insert({
      product_id: product.id,
      product_name: product.name,
      deleted_quantity: product.quantity,
      deleted_by: userId,
      location_id: product.location_id,
      photo_url: imageUrl, // 🔥 เก็บรูป
    })

  // ✅ ลบจริง
  await supabaseAdmin
    .from('products')
    .delete()
    .eq('id', productId)
    .eq('owner_id', userId)

  return { deleted: true }
}