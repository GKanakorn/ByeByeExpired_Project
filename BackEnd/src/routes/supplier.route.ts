import { Router, Response } from "express"
import { requireAuth } from "../middleware/auth.middleware"
import { requireLocationRole } from "../middleware/locationRole.middleware"
import { AuthRequest } from "../types/auth-request"
import { supabaseAdmin } from "../supabase"

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

      const { data, error } = await supabaseAdmin
        .from("suppliers")
        .insert([
          {
            user_id: ownerId,
            company_name,
            phone,
            address,
            email,
            contact_name,
            note,
            image_url,
          },
        ])
        .select()

      if (error) {
        return res.status(400).json({
          error,
          message: "Create supplier failed",
        })
      }

      res.json(data[0])
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

      const { data, error } = await supabaseAdmin
        .from("suppliers")
        .select("*")
        .eq("user_id", supplierOwnerId)
        .order("created_at", { ascending: false })

      if (error) {
        return res.status(400).json({ message: error.message })
      }

      res.json(data)
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
      const supplierId = req.params.id

      if (!locationId) {
        return res.status(400).json({ message: "locationId is required" })
      }

      const ownerId = await getLocationOwnerId(locationId)

      const { data, error } = await supabaseAdmin
        .from("suppliers")
        .select("*")
        .eq("id", supplierId)
        .eq("user_id", ownerId)
        .single()

      if (error) {
        return res.status(400).json({ message: error.message })
      }

      res.json(data)
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
      const supplierId = req.params.id

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

      const { data, error } = await supabaseAdmin
        .from("suppliers")
        .update({
          company_name,
          phone,
          address,
          email,
          contact_name,
          note,
          image_url,
          updated_at: new Date().toISOString(),
        })
        .eq("id", supplierId)
        .eq("user_id", ownerId)
        .select()

      if (error) {
        return res.status(400).json({ message: error.message })
      }

      res.json(data[0])
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
      const supplierId = req.params.id

      if (!locationId) {
        return res.status(400).json({ message: "locationId is required" })
      }

      const ownerId = await getLocationOwnerId(locationId)

      const { error } = await supabaseAdmin
        .from("suppliers")
        .delete()
        .eq("id", supplierId)
        .eq("user_id", ownerId)

      if (error) {
        return res.status(400).json({ message: error.message })
      }

      res.json({ success: true })
    } catch (err) {
      res.status(500).json({ message: "Delete failed" })
    }
  }
)

export default router