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
  const { data: existingTemplate } = await supabaseAdmin
    .from('product_templates')
    .select('*')
    .eq('barcode', barcode)
    .maybeSingle()

  let templateId = existingTemplate?.id ?? null

  // ===============================
  // 2️⃣ ถ้าไม่มี template → สร้างใหม่
  // ===============================
  if (!existingTemplate) {
    const { data: newTemplate, error } = await supabaseAdmin
      .from('product_templates')
      .insert({
        barcode,
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