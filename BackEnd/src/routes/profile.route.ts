// src/routes/profile.route.ts
import { Router, Response } from 'express'
import { requireAuth } from '../middleware/auth.middleware'
import { AuthRequest } from '../types/auth-request'
import {
  getProfile,
  updateProfile,
  getProfileStats,
} from '../services/profile.service'

const router = Router()

// GET PROFILE
router.get(
  '/',
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id
      const profile = await getProfile(userId)
      res.json(profile)
    } catch (err: any) {
      res.status(400).json({ message: err.message })
    }
  }
)

// UPDATE PROFILE
router.put(
  '/',
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id
      const updated = await updateProfile(userId, req.body)
      res.json(updated)
    } catch (err: any) {
      res.status(400).json({ message: err.message })
    }
  }
)

// GET PROFILE STATS
router.get(
  '/stats',
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id
      const stats = await getProfileStats(userId)
      res.json(stats)
    } catch (err: any) {
      res.status(400).json({ message: err.message })
    }
  }
)

export default router