import { Router, Response } from "express"
import { requireAuth } from "../middleware/auth.middleware"
import { requireLocationRole } from "../middleware/locationRole.middleware"
import { AuthRequest } from "../types/auth-request"
import { supabaseAdmin } from "../supabase"
import {
  createSupplier,
  getSuppliersByUser,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
} from "../services/supplier.service"

const router = Router()

async function getLocationOwnerId(locationId: string) {
  const { data: location, error } = await supabaseAdmin
    .from("locations")
    .select("owner_id")
    .eq("id", locationId)
    .single()

  if (error || !location) {
    throw new Error("Location not found")
  }

  return location.owner_id as string
}

async function resolveOwnerForAccessibleLocation(
  userId: string,
  locationId: string,
  allowedRoles: Array<'owner' | 'admin' | 'member'> = ['owner', 'admin']
) {
  const ownerId = await getLocationOwnerId(locationId)

  if (ownerId === userId) {
    return ownerId
  }

  const { data: member } = await supabaseAdmin
    .from('location_members')
    .select('role')
    .eq('location_id', locationId)
    .eq('user_id', userId)
    .single()

  if (!member) {
    throw new Error('Not a member')
  }

  if (!allowedRoles.includes(member.role as 'owner' | 'admin' | 'member')) {
    throw new Error('Insufficient permission')
  }

  return ownerId
}

// ==========================
// CREATE SUPPLIER
// ==========================
router.post(
  "/",
  requireAuth,
  requireLocationRole(["owner", "admin"]),
  async (req: AuthRequest, res: Response) => {
    try {
      const locationId = req.body.locationId || req.body.location_id

      if (!locationId) {
        return res.status(400).json({ message: "locationId is required" })
      }

      const ownerId = await getLocationOwnerId(locationId)

      const {
        company_name,
        phone,
        address,
        email,
        contact_name,
        note,
        image_url,
      } = req.body

      const supplier = await createSupplier({
        user_id: ownerId,
        company_name,
        phone,
        address,
        email,
        contact_name,
        note,
        image_url,
      })

      res.json(supplier)
    } catch (err) {
      console.error(err)
      res.status(500).json({ message: "Server error" })
    }
  }
)

// ==========================
// GET ALL SUPPLIERS
// ==========================
router.get(
  "/",
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const locationId = req.query.locationId as string | undefined
      let supplierOwnerId = req.user!.id

      if (locationId && locationId !== 'undefined' && locationId !== 'null') {
        supplierOwnerId = await resolveOwnerForAccessibleLocation(
          req.user!.id,
          locationId,
          ['owner', 'admin']
        )
      }

      const suppliers = await getSuppliersByUser(supplierOwnerId)

      res.json(suppliers)
    } catch (err) {
      console.error('GET SUPPLIERS ERROR:', err)
      res.status(500).json({ message: "Fetch suppliers failed" })
    }
  }
)

// ==========================
// GET ONE SUPPLIER
// ==========================
router.get(
  "/:id",
  requireAuth,
  requireLocationRole(["owner", "admin"]),
  async (req: AuthRequest, res: Response) => {
    try {
      const locationId = req.query.locationId as string | undefined
      const supplierId = req.params.id as string

      if (!locationId) {
        return res.status(400).json({ message: "locationId is required" })
      }

      const ownerId = await getLocationOwnerId(locationId)

      const supplier = await getSupplierById(supplierId, ownerId)

      res.json(supplier)
    } catch (err) {
      res.status(500).json({ message: "Fetch supplier failed" })
    }
  }
)

// ==========================
// UPDATE SUPPLIER
// ==========================
router.put(
  "/:id",
  requireAuth,
  requireLocationRole(["owner", "admin"]),
  async (req: AuthRequest, res: Response) => {
    try {
      const locationId = req.body.locationId || req.query.locationId
      const supplierId = req.params.id as string as string

      if (!locationId) {
        return res.status(400).json({ message: "locationId is required" })
      }

      const ownerId = await getLocationOwnerId(locationId as string)

      const {
        company_name,
        phone,
        address,
        email,
        contact_name,
        note,
        image_url,
      } = req.body

      const supplier = await updateSupplier(supplierId, ownerId, {
        company_name,
        phone,
        address,
        email,
        contact_name,
        note,
        image_url,
      })

      res.json(supplier)
    } catch (err) {
      res.status(500).json({ message: "Update failed" })
    }
  }
)

// ==========================
// DELETE SUPPLIER
// ==========================
router.delete(
  "/:id",
  requireAuth,
  requireLocationRole(["owner", "admin"]),
  async (req: AuthRequest, res: Response) => {
    try {
      const locationId = req.query.locationId as string | undefined
      const supplierId = req.params.id as string as string

      if (!locationId) {
        return res.status(400).json({ message: "locationId is required" })
      }

      const ownerId = await getLocationOwnerId(locationId)

      await deleteSupplier(supplierId, ownerId)

      res.json({ success: true })
    } catch (err) {
      res.status(500).json({ message: "Delete failed" })
    }
  }
)

export default router