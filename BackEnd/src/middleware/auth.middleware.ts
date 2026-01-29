import { Response, NextFunction } from 'express'
import { supabaseAdmin } from '../supabase'
import { AuthRequest } from '../types/auth-request'

export async function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    return res.status(401).json({ message: 'Missing token' })
  }

  const token = authHeader.replace('Bearer ', '')

  const { data, error } = await supabaseAdmin.auth.getUser(token)

  if (error || !data.user) {
    return res.status(401).json({ message: 'Invalid token' })
  }

  req.user = data.user
  next()
}