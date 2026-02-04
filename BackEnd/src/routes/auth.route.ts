// BackEnd/src/services/auth.route.ts
import { Router } from 'express'
import { register, login  } from '../services/auth.service'

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

export default router