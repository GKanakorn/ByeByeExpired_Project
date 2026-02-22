import { Router, Response } from "express"
import { requireAuth } from "../middleware/auth.middleware"
import { AuthRequest } from "../types/auth-request"
import { supabaseAdmin } from "../supabase"

const router = Router()

// ==========================
// CREATE SUPPLIER
// ==========================
router.post(
  "/",
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id

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
            user_id: userId,
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
      const userId = req.user!.id

      const { data, error } = await supabaseAdmin
        .from("suppliers")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) {
        return res.status(400).json({ message: error.message })
      }

      res.json(data)
    } catch (err) {
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
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id
      const supplierId = req.params.id

      const { data, error } = await supabaseAdmin
        .from("suppliers")
        .select("*")
        .eq("id", supplierId)
        .eq("user_id", userId)
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
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id
      const supplierId = req.params.id

      const { data, error } = await supabaseAdmin
        .from("suppliers")
        .update(req.body)
        .eq("id", supplierId)
        .eq("user_id", userId)
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
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id
      const supplierId = req.params.id

      const { error } = await supabaseAdmin
        .from("suppliers")
        .delete()
        .eq("id", supplierId)
        .eq("user_id", userId)

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