// routes/product.routes.ts
import { Router, Response } from 'express'
import { requireAuth } from '../middleware/auth.middleware'
import {
  createProduct,
  getOverview,
  deleteProductQuantity,
  getProductsByLocation,
  getProductsByBarcode,
  searchProducts,
  getProductById
} from '../services/product.service'
import { AuthRequest } from '../types/auth-request'

const router = Router()


router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id
    const result = await createProduct(userId, req.body)
    res.json(result)
  } catch (err: any) {
    console.error('🔥 ADD PRODUCT ERROR:', err)
    res.status(500).json({
      message: err.message || 'Add product failed',
    })
  }
})

router.get('/overview/:locationId', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id
    const locationId = req.params.locationId as string

    const result = await getOverview(userId, locationId)
    res.json(result)
  } catch (err: any) {
    console.error('🔥 OVERVIEW ERROR:', err)
    res.status(500).json({
      message: err.message || 'Get overview failed',
    })
  }
})

router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id
    const locationIdRaw = req.query.locationId

    if (typeof locationIdRaw !== 'string') {
      return res.status(400).json({ message: 'locationId is required' })
    }

    const products = await getProductsByLocation(
      userId,
      locationIdRaw
    )

    res.json(products)
  } catch (err: any) {
    console.error('🔥 GET PRODUCTS ERROR:', err)
    res.status(500).json({
      message: err.message || 'Fetch products failed',
    })
  }
})

router.get('/search', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id
    const { locationId, q } = req.query

    if (typeof locationId !== 'string') {
      return res.status(400).json({ message: 'locationId is required' })
    }

    if (typeof q !== 'string' || q.trim() === '') {
      return res.status(400).json({ message: 'Search keyword (q) is required' })
    }

    const result = await searchProducts(
      userId,
      locationId,
      q
    )

    res.json(result)
  } catch (err: any) {
    console.error('🔥 SEARCH PRODUCTS ERROR:', err)
    res.status(500).json({
      message: err.message || 'Search products failed',
    })
  }
})

router.get('/by-barcode/:barcode', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id
    const barcode = req.params.barcode as string
    const locationId = req.query.locationId as string

    if (!locationId) {
      return res.status(400).json({ message: 'locationId is required' })
    }

    const result = await getProductsByBarcode(
      userId,
      barcode,
      locationId
    )

    res.json(result)
  } catch (err: any) {
    console.error('🔥 FETCH BY BARCODE ERROR:', err)
    res.status(500).json({
      message: err.message || 'Fetch product failed',
    })
  }
})
router.patch('/:id/delete', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id
    const productId = req.params.id as string
    const { quantity } = req.body

    if (!quantity) {
      return res.status(400).json({ message: 'Quantity is required' })
    }

    const result = await deleteProductQuantity(
      userId,
      productId,
      Number(quantity)
    )

    res.json(result)
  } catch (err: any) {
    console.error('🔥 DELETE PRODUCT ERROR:', err)
    res.status(500).json({
      message: err.message || 'Delete product failed',
    })
  }
})

router.get(
  '/locations/:locationId/products',
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id
      const locationIdRaw = req.query.locationId

      const products = await getProductsByLocation(
      userId,
      locationIdRaw as string
    )

      res.json(products)
    } catch (err: any) {
      console.error('GET PRODUCTS ERROR FULL:', err)

      res.status(400).json({
        message:
          err?.message ||
          err?.details ||
          (typeof err === 'object' ? JSON.stringify(err) : err) ||
          'Fetch products failed',
      })
    }
  }
)

router.get('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id
    const productId = req.params.id as string

    const product = await getProductById(userId, productId)

    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    res.json(product)

  } catch (err: any) {
    console.error('🔥 GET PRODUCT DETAIL ERROR:', err)
    res.status(500).json({
      message: err.message || 'Fetch product detail failed',
    })
  }
})

export default router