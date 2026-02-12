// routes/product.routes.ts
import { Router, Response } from 'express'
import { requireAuth } from '../middleware/auth.middleware'
import { createProduct, getOverview } from '../services/product.service'
import { AuthRequest } from '../types/auth-request'

const router = Router()

router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id
    const result = await createProduct(userId, req.body)
    res.json(result)
  } catch (err: any) {
  console.error('🔥 ADD PRODUCT ERROR:', err)
  res.status(500).json({
    message: err.message || 'Add product failed',
  })
}
})

export default router

router.get('/overview/:locationId', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id
    const locationId = req.params.locationId as string

    const result = await getOverview(userId, locationId)
    res.json(result)
  } catch (err: any) {
    console.error('🔥 OVERVIEW ERROR:', err)
    res.status(500).json({
      message: err.message || 'Get overview failed',
    })
  }
})