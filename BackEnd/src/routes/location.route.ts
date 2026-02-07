import { Router, Response } from 'express'
import { requireAuth } from '../middleware/auth.middleware'
import { createLocation } from '../services/location.service'
import { deleteLocation } from '../services/location.service'
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

    // 🔹 locations ที่เป็นเจ้าของ
    const { data: owned, error: ownedErr } = await supabaseAdmin
      .from('locations')
      .select('id, name, type')   // ⭐ เพิ่ม type
      .eq('owner_id', userId)

    if (ownedErr) {
      return res.status(400).json({ message: ownedErr.message })
    }

    // 🔹 locations ที่เป็นสมาชิก
    const { data: memberOf, error: memberErr } = await supabaseAdmin
      .from('location_members')
      .select(`
        locations (
          id,
          name,
          type
        )
      `)
      .eq('user_id', userId)

    if (memberErr) {
      return res.status(400).json({ message: memberErr.message })
    }

    const memberLocations = (memberOf ?? [])
      .flatMap(row => row.locations ?? [])

    // 🔹 รวมข้อมูล + กันซ้ำ
    const map = new Map<string, { id: string; name: string; type: string }>()

    ;(owned ?? []).forEach(loc => map.set(loc.id, loc))
    memberLocations.forEach(loc => map.set(loc.id, loc))

    const result = Array.from(map.values())

    console.log('📍 LOCATIONS RESULT =', result)

    res.json(result)
  }
)

router.delete(
  '/locations/:id',
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id
      const locationId = req.params.id as string  // ⭐ FIX ตรงนี้

      await deleteLocation(userId, locationId)

      res.json({ success: true })
    } catch (err) {
      console.error(err)
      res.status(400).json({ message: 'Cannot delete location' })
    }
  }
)

export default router