import { Router, Response } from 'express'
import { requireAuth } from '../middleware/auth.middleware'
import { requireLocationRole } from '../middleware/locationRole.middleware'
import { createStorage } from '../services/storage.service'
import { AuthRequest } from '../types/auth-request'

const router = Router()

router.post(
  '/locations/:locationId/storages',
  requireAuth,
  requireLocationRole(['admin', 'editor']),
  async (req: AuthRequest, res: Response) => {
    try {
      const locationId = req.params.locationId as string
      const { name, icon, color } = req.body

      const storage = await createStorage({
        name,
        icon,
        color,
        location_id: locationId,
      })

      res.json(storage)
    } catch (err: any) {
      console.error('CREATE STORAGE ERROR:', err)
      res.status(400).json({
        message: err.message || 'Create storage failed',
      })
    }
  }
)

export default router

