import { Router, Response } from 'express'
import { requireAuth } from '../middleware/auth.middleware'
import { requireLocationRole } from '../middleware/locationRole.middleware'
import { createStorage, deleteStorage } from '../services/storage.service'
import { AuthRequest } from '../types/auth-request'
import { getStoragesByLocation } from '../services/storage.service'
import { updateStorage } from '../services/storage.service'
import { getStorageById } from '../services/storage.service'

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
      console.error('CREATE STORAGE ERROR FULL:', err)

      res.status(400).json({
        message:
          err?.message ||
          err?.details ||
          (typeof err === 'object' ? JSON.stringify(err) : err) ||
          'Create storage failed',
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
      console.error('GET STORAGES ERROR FULL:', err)

      res.status(400).json({
        message:
          err?.message ||
          err?.details ||
          (typeof err === 'object' ? JSON.stringify(err) : err) ||
          'Fetch storages failed',
      })
    }
  }
)

router.delete(
  '/storages/:storageId',
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id
      const storageId = req.params.storageId as string

      const result = await deleteStorage(userId, storageId)
      res.json(result)
    } catch (err: any) {
      console.error('DELETE STORAGE ERROR FULL:', err)

      res.status(400).json({
        message:
          err?.message ||
          err?.details ||
          (typeof err === 'object' ? JSON.stringify(err) : err) ||
          'Delete storage failed',
      })
    }
  }
)

router.put(
  '/storages/:storageId',
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const storageId = req.params.storageId as string
      const { name, icon, color } = req.body

      const updated = await updateStorage(storageId, {
        name,
        icon,
        color,
      })

      res.json(updated)
    } catch (err: any) {
      console.error('UPDATE STORAGE ERROR FULL:', err)

      res.status(400).json({
        message:
          err?.message ||
          err?.details ||
          (typeof err === 'object' ? JSON.stringify(err) : err) ||
          'Update storage failed',
      })
    }
  }
)
router.get(
  '/storages/:storageId',
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const storageId = req.params.storageId as string

      const storage = await getStorageById(storageId)
      res.json(storage)
    } catch (err: any) {
      console.error('GET STORAGE DETAIL ERROR FULL:', err)

      res.status(400).json({
        message:
          err?.message ||
          err?.details ||
          (typeof err === 'object' ? JSON.stringify(err) : err) ||
          'Fetch storage detail failed',
      })
    }
  }
)

export default router

