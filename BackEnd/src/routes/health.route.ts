import { Router, Response } from 'express'
import { supabaseAdmin } from '../supabase'

const router = Router()

router.get('/ping', async (_, res: Response) => {
  // query เบา ๆ แค่ 1 แถว
  const { error } = await supabaseAdmin
    .from('locations')
    .select('id')
    .limit(1)

  if (error) {
    return res.status(500).json({ ok: false, error: error.message })
  }

  res.json({
    ok: true,
    message: 'Supabase is alive 🚀',
    time: new Date().toISOString(),
  })
})

export default router