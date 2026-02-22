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
      expiration_date,
      location_id,
      owner_id,
      product_templates (
        image_url
      )
    `)
    .eq('location_id', locationId)
    .eq('owner_id', userId)

  if (error) throw error

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const threeDaysLater = new Date()
  threeDaysLater.setHours(0, 0, 0, 0)
  threeDaysLater.setDate(threeDaysLater.getDate() + 3)

  const nearlyExpired = (items || []).filter((item: any) => {
    if (!item.expiration_date) return false
    const exp = new Date(item.expiration_date)
    exp.setHours(0, 0, 0, 0)
    return exp >= today && exp <= threeDaysLater
  })

  const expired = (items || []).filter((item: any) => {
    if (!item.expiration_date) return false
    const exp = new Date(item.expiration_date)
    exp.setHours(0, 0, 0, 0)
    return exp < today
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
  // 1️⃣ ดึง product ก่อน
  const { data: product, error: fetchError } = await supabaseAdmin
    .from('products')
    .select('id, quantity, owner_id')
    .eq('id', productId)
    .eq('owner_id', userId)
    .single()

  if (fetchError || !product) {
    throw new Error('Product not found')
  }

  if (quantityToDelete <= 0) {
    throw new Error('Invalid quantity')
  }

  // 2️⃣ ถ้าลบหมดหรือมากกว่า → ลบทั้ง row
  if (product.quantity <= quantityToDelete) {
    const { error: deleteError } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', productId)
      .eq('owner_id', userId)

    if (deleteError) throw deleteError

    return { deleted: true }
  }

  // 3️⃣ ถ้ายังเหลือ → update quantity
  const { error: updateError } = await supabaseAdmin
    .from('products')
    .update({
      quantity: product.quantity - quantityToDelete,
    })
    .eq('id', productId)
    .eq('owner_id', userId)

  if (updateError) throw updateError

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
        image_url
      )
    `)
    .eq('owner_id', userId)
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
    .eq('owner_id', userId)
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
      quantity,
      expiration_date,
      storage_id,
      location_id,
      product_templates!inner (
        id,
        name,
        image_url,
        barcode
      )
    `)
    .eq('owner_id', userId)         // ✅ ถูกต้อง
    .eq('location_id', locationId)  // ✅ ถูกต้อง
    .ilike('product_templates.name', `%${keyword}%`)
    .order('expiration_date', { ascending: true })

  if (error) throw error

  return data || []
}