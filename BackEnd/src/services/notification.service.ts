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
  // 1️⃣ Get owned locations
  const { data: ownedLocations, error: ownedLocError } = await supabaseAdmin
    .from('locations')
    .select('id, name, type')
    .eq('owner_id', userId)

  if (ownedLocError) throw ownedLocError

  // 2️⃣ Get locations where user is a member
  const { data: membershipRows, error: membershipError } = await supabaseAdmin
    .from('location_members')
    .select('location_id')
    .eq('user_id', userId)

  if (membershipError) throw membershipError

  const memberLocationIds = (membershipRows ?? []).map((row: any) => row.location_id)

  let memberLocations: Array<{ id: string; name: string; type: 'personal' | 'business' }> = []

  if (memberLocationIds.length > 0) {
    const { data, error } = await supabaseAdmin
      .from('locations')
      .select('id, name, type')
      .in('id', memberLocationIds)

    if (error) throw error
    memberLocations = (data ?? []) as Array<{ id: string; name: string; type: 'personal' | 'business' }>
  }

  const locationMap = new Map<string, { id: string; name: string; type: 'personal' | 'business' }>()

  for (const location of ownedLocations ?? []) {
    locationMap.set(location.id, location as { id: string; name: string; type: 'personal' | 'business' })
  }

  for (const location of memberLocations) {
    locationMap.set(location.id, location)
  }

  const locations = Array.from(locationMap.values())

  if (locations.length === 0) return []

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const result: LocationNotifications[] = []

  // 3️⃣ For each location, find notifications
  for (const location of locations) {
    const notifications: NotificationItem[] = []

    // 4️⃣ Get all products for this location
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

    // 5️⃣ Check each product for notifications
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

    // 6️⃣ Only add location if it has notifications
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
