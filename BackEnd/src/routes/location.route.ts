import { Router, Response } from 'express'
import { requireAuth } from '../middleware/auth.middleware'
import { createLocation, updateLocation } from '../services/location.service'
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

    // 🔹 locations ที่เป็นเจ้าของ → role = owner
    const { data: owned, error: ownedErr } = await supabaseAdmin
      .from('locations')
      .select('id, name, type, owner_id')
      .eq('owner_id', userId)

    if (ownedErr) {
      return res.status(400).json({ message: ownedErr.message })
    }

    const ownedWithRole = (owned ?? []).map(loc => ({
      ...loc,
      role: 'owner' as const,
    }))

    // 🔹 locations ที่เป็นสมาชิก → เอา role จาก location_members
    const { data: memberOf, error: memberErr } = await supabaseAdmin
      .from('location_members')
      .select(`
        role,
        locations:location_id (
          id,
          name,
          type,
          owner_id
        )
      `)
      .eq('user_id', userId)

    if (memberErr) {
      return res.status(400).json({ message: memberErr.message })
    }

    const memberWithRole: Array<{
      id: string
      name: string
      type: string
      owner_id: string
      role: 'owner' | 'member'
    }> = (memberOf ?? [])
      .map(row => {
        const loc = Array.isArray(row.locations)
          ? row.locations[0]
          : row.locations
        if (!loc) return null

        return {
          id: loc.id,
          name: loc.name,
          type: loc.type,
          owner_id: loc.owner_id,
          role: row.role === 'owner' ? 'owner' : 'member',
        }
      })
      .filter(
        (
          item
        ): item is {
          id: string
          name: string
          type: string
          owner_id: string
          role: 'owner' | 'member'
        } => item !== null
      )

    // 🔹 รวมข้อมูล + กันซ้ำ (owner มี priority สูงสุด)
    const map = new Map<string, {
      id: string
      name: string
      type: string
      owner_id: string
      role: 'owner' | 'member'
    }>()

    ownedWithRole.forEach(loc => map.set(loc.id, loc))
    memberWithRole.forEach(loc => {
      if (!map.has(loc.id)) {
        map.set(loc.id, loc)
      }
    })

    const result = Array.from(map.values())

    console.log('📍 LOCATIONS RESULT =', result)

    res.json(result)
  }
)

router.put(
  '/locations/:id',
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id
      const locationId = req.params.id as string

      const updated = await updateLocation(userId, locationId, req.body)

      res.json(updated)
    } catch (err: any) {
      console.error(err)
      res.status(400).json({ message: err?.message || 'Cannot update location' })
    }
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
    } catch (err: any) {
      console.error(err)
      res.status(400).json({ message: err?.message || 'Cannot delete location' })
    }
  }
)

export default router