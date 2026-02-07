import { Router, Response } from 'express'
import { requireAuth } from '../middleware/auth.middleware'
import { requireLocationRole } from '../middleware/locationRole.middleware'
import { createStorage } from '../services/storage.service'
import { AuthRequest } from '../types/auth-request'
import { getStoragesByLocation } from '../services/storage.service'

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

router.get(
  '/locations/:locationId/storages',
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const locationId = req.params.locationId as string

      const storages = await getStoragesByLocation(locationId)
      res.json(storages)
    } catch (err: any) {
      console.error('GET STORAGES ERROR:', err)
      res.status(400).json({
        message: err.message || 'Fetch storages failed',
      })
    }
  }
)

export default router

