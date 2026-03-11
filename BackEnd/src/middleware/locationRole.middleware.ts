import { Response, NextFunction } from 'express'
import { supabaseAdmin } from '../supabase'
import { AuthRequest } from '../types/auth-request'

export function requireLocationRole(
  allowedRoles: Array<'owner' | 'member'>
) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // try to grab location id from various sources (camel or snake case)
    let locationId =
      (req.params as any).locationId ||
      (req.query as any).locationId ||
      (req.query as any).location_id ||
      req.body?.location_id ||
      req.body?.locationId

    // if we still don't have a location and there is an :id param
    // (used for products, etc.), fetch the record to determine
    // the associated location
    if (!locationId && req.params.id) {
      const { data: record } = await supabaseAdmin
        .from('products')
        .select('location_id')
        .eq('id', req.params.id)
        .single()

      locationId = record?.location_id
    }

    if (!locationId && req.params.storageId) {
      const { data: storage } = await supabaseAdmin
        .from('storages')
        .select('location_id')
        .eq('id', req.params.storageId)
        .single()

      locationId = storage?.location_id
    }

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

    const normalizedRole =
      member.role === 'owner' ? 'owner' : 'member'

    if (!allowedRoles.includes(normalizedRole)) {
      return res.status(403).json({ error: 'Insufficient permission' })
    }

    next()
  }
}