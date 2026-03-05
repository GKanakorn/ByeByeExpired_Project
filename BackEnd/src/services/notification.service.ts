// services/notification.service.ts
import { supabaseAdmin } from '../supabase'

export interface NotificationItem {
  id: string
  name: string
  imageUrl: string | null
  quantity: number
  type: 'expiring' | 'low_stock'
  expirationDate?: string
  daysUntilExpiry?: number
  storageId?: string
}

export interface LocationNotifications {
  locationId: string
  locationName: string
  locationType: 'personal' | 'business'
  notifications: NotificationItem[]
}

export async function getUserNotifications(userId: string): Promise<LocationNotifications[]> {
  // 1️⃣ Get all locations for the user
  const { data: locations, error: locError } = await supabaseAdmin
    .from('locations')
    .select('id, name, type')
    .eq('owner_id', userId)

  if (locError) throw locError
  if (!locations || locations.length === 0) return []

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const result: LocationNotifications[] = []

  // 2️⃣ For each location, find notifications
  for (const location of locations) {
    const notifications: NotificationItem[] = []

    // 3️⃣ Get all products for this location
    const { data: products, error: prodError } = await supabaseAdmin
      .from('products')
      .select(`
        id,
        name,
        quantity,
        expiration_date,
        notify_enabled,
        notify_before_days,
        low_stock_enabled,
        low_stock_threshold,
        storage_id,
        product_templates (
          image_url
        )
      `)
      .eq('location_id', location.id)

    if (prodError) throw prodError
    if (!products) continue

    // 4️⃣ Check each product for notifications
    for (const product of products) {
      const template = product.product_templates as
        | { image_url: string | null }
        | { image_url: string | null }[]
        | null

      const imageUrl = Array.isArray(template)
        ? template[0]?.image_url ?? null
        : template?.image_url ?? null

      // 🔔 Expiration Alert (Both Personal & Business)
      if (
        product.notify_enabled &&
        product.notify_before_days !== null &&
        product.notify_before_days !== undefined &&
        product.expiration_date
      ) {
        const expiryDate = new Date(product.expiration_date)
        expiryDate.setHours(0, 0, 0, 0)

        const alertDate = new Date(expiryDate)
        alertDate.setDate(alertDate.getDate() - product.notify_before_days)

        // Check if today is on or after the alert date and the product hasn't expired yet
        if (today >= alertDate && today <= expiryDate) {
          const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

          notifications.push({
            id: product.id,
            name: product.name,
            imageUrl,
            quantity: product.quantity,
            type: 'expiring',
            expirationDate: product.expiration_date,
            daysUntilExpiry,
            storageId: product.storage_id,
          })
        }
      }

      // 🔔 Low Stock Alert (Business Only)
      if (
        location.type === 'business' &&
        product.low_stock_enabled &&
        product.low_stock_threshold !== null &&
        product.low_stock_threshold !== undefined
      ) {
        if (product.quantity <= product.low_stock_threshold) {
          notifications.push({
            id: product.id,
            name: product.name,
            imageUrl,
            quantity: product.quantity,
            type: 'low_stock',
            storageId: product.storage_id,
          })
        }
      }
    }

    // 5️⃣ Only add location if it has notifications
    if (notifications.length > 0) {
      result.push({
        locationId: location.id,
        locationName: location.name,
        locationType: location.type,
        notifications,
      })
    }
  }

  return result
}
