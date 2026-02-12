// src/routes/barcode.route.ts
import { Router } from 'express'
import { lookupBarcode } from '../services/barcode.service'

const router = Router()

router.get('/:barcode', async (req, res) => {
  const barcode = req.params.barcode as string
  const result = await lookupBarcode(barcode)
  res.json(result)
})
export default router