// api/notification.api.ts
import { API_URL } from '../config/api'

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

export async function getUserNotifications(token: string): Promise<LocationNotifications[]> {
  const res = await fetch(`${API_URL}/api/notifications`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    throw new Error('Cannot load notifications')
  }

  return res.json()
}
