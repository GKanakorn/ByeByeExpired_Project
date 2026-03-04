// BackEnd/src/services/auth.route.ts
import { Router } from 'express'
import { register, login, confirmAndCreateProfile, verifyOrCreateProfileGoogle, deleteAccount } from '../services/auth.service'
import { requireAuth } from '../middleware/auth.middleware'
import { AuthRequest } from '../types/auth-request'

const router = Router()

router.post('/register', async (req, res) => {
  try {
    const { email, password, fullName } = req.body

    if (!email || !password || !fullName) {
      return res.status(400).json({ message: 'Missing fields' })
    }

    const user = await register({ email, password, fullName })

    res.status(201).json({
      message: 'Register success',
      userId: user.id,
    })
  } catch (err: any) {
    res.status(400).json({
      message: err.message || 'Register failed',
    })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Missing email or password' })
    }

    const result = await login({ email, password })

    res.json(result)
  } catch (err: any) {
    res.status(401).json({
      message: err.message || 'Login failed',
    })
  }
})

// ✅ Manual Registration - After OTP verification
router.post('/confirm-profile', async (req, res) => {
  try {
    const { userId, email, fullName } = req.body

    if (!userId || !email || !fullName) {
      return res.status(400).json({ message: 'Missing fields' })
    }

    const result = await confirmAndCreateProfile(userId, email, fullName, 'email')

    res.json({
      message: 'Profile created successfully',
      ...result,
    })
  } catch (err: any) {
    res.status(400).json({
      message: err.message || 'Failed to create profile',
    })
  }
})

// ✅ Google OAuth - Verify/Create Profile
router.post('/verify-google-profile', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.user!
    const result = await verifyOrCreateProfileGoogle(
      user.id,
      user.email || '',
      user.user_metadata?.full_name,
      user.user_metadata?.avatar_url
    )

    res.json({
      message: 'Google profile verified/created',
      ...result,
    })
  } catch (err: any) {
    res.status(400).json({
      message: err.message || 'Failed to verify google profile',
    })
  }
})

// ✅ Delete Account
router.delete('/account', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id
    await deleteAccount(userId)
    res.json({ message: 'Account deleted successfully' })
  } catch (err: any) {
    res.status(500).json({
      message: err.message || 'Delete account failed',
    })
  }
})

export default router