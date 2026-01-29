import { Router, Response } from 'express'
import { requireAuth } from '../middleware/auth.middleware'
import { createLocation } from '../services/location.service'
import { AuthRequest } from '../types/auth-request'
import { supabaseAdmin } from '../supabase'

const router = Router()

router.post(
  '/locations',
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const location = await createLocation(req.user.id, req.body)
    res.json(location)
  }
)

router.get(
  '/locations',
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id

    const { data: owned } = await supabaseAdmin
      .from('locations')
      .select('id, name')
      .eq('owner_id', userId)

    const { data: memberOf } = await supabaseAdmin
      .from('location_members')
      .select(`
        locations (
          id,
          name
        )
      `)
      .eq('user_id', userId)

    const memberLocations = (memberOf ?? [])
      .flatMap(row => row.locations ?? [])

    const map = new Map<string, { id: string; name: string }>()

    ;(owned ?? []).forEach(loc => map.set(loc.id, loc))
    memberLocations.forEach(loc => map.set(loc.id, loc))

    const result = Array.from(map.values())

    console.log('📍 LOCATIONS RESULT =', result) // 👈 เพิ่มบรรทัดนี้

    res.json(result)
  }
)

export default router