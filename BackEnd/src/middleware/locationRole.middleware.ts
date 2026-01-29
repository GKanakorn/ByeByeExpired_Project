import { Response, NextFunction } from 'express'
import { supabaseAdmin } from '../supabase'
import { AuthRequest } from '../types/auth-request'

export function requireLocationRole(
  allowedRoles: Array<'admin' | 'editor' | 'viewer'>
) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const locationId = req.params.locationId || req.body.location_id
    if (!locationId) {
      return res.status(400).json({ error: 'Missing location_id' })
    }

    // 1️⃣ owner ผ่านทุกอย่าง
    const { data: location } = await supabaseAdmin
      .from('locations')
      .select('owner_id')
      .eq('id', locationId)
      .single()

    if (!location) {
      return res.status(404).json({ error: 'Location not found' })
    }

    if (location.owner_id === req.user.id) {
      return next()
    }

    // 2️⃣ เช็ค role
    const { data: member } = await supabaseAdmin
      .from('location_members')
      .select('role')
      .eq('location_id', locationId)
      .eq('user_id', req.user.id)
      .single()

    if (!member) {
      return res.status(403).json({ error: 'Not a member' })
    }

    if (!allowedRoles.includes(member.role)) {
      return res.status(403).json({ error: 'Insufficient permission' })
    }

    next()
  }
}