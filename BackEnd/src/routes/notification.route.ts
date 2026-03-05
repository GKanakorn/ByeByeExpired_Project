// routes/notification.route.ts
import { Router } from 'express'
import { getUserNotifications } from '../services/notification.service'
import { requireAuth } from '../middleware/auth.middleware'
import { AuthRequest } from '../types/auth-request'

const router = Router()

/**
 * GET /api/notifications
 * Get all notifications for the current user across all locations
 */
router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const notifications = await getUserNotifications(userId)
    res.json(notifications)
  } catch (error: any) {
    console.error('Error fetching notifications:', error)
    res.status(500).json({ message: error.message || 'Failed to fetch notifications' })
  }
})

export default router
