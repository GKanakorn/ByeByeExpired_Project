import express from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { requireLocationRole } from "../middleware/locationRole.middleware";
import { AuthRequest } from "../types/auth-request";
import {
  getLocationMembers,
  updateMemberRoleService,
  deleteMemberService,
  inviteMemberService,
} from "../services/manageLocation.service";

const router = express.Router();

router.get("/locations/:locationId/members", requireAuth, requireLocationRole(["owner", "member"]), async (req: AuthRequest, res) => {
  try {
    const locationId = req.params.locationId as string;

    const members = await getLocationMembers(locationId);

    res.status(200).json(members);
  } catch (error: any) {
    console.error("GET members error:", error);
    res.status(500).json({
      message: error?.message || "Failed to fetch members",
    });
  }
});

router.put(
  "/locations/:locationId/members/:memberId",
  requireAuth,
  requireLocationRole(["owner"]),
  async (req: AuthRequest, res) => {
    try {
      const locationId = req.params.locationId as string;
      const memberId = req.params.memberId as string;
      const role = req.body.role as string;
      await updateMemberRoleService(locationId, memberId, role);
      res.status(200).json({ message: "Role updated" });
    } catch (error) {
      res.status(500).json({ error: "Failed to update role" });
    }
  }
);

router.delete(
  "/locations/:locationId/members/:memberId",
  requireAuth,
  requireLocationRole(["owner"]),
  async (req: AuthRequest, res) => {
    try {
      const locationId = req.params.locationId as string;
      const memberId = req.params.memberId as string;
      await deleteMemberService(locationId, memberId);
      res.status(200).json({ message: "Member deleted" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete member" });
    }
  }
);

router.post(
  "/locations/:locationId/members",
  requireAuth,
  requireLocationRole(["owner"]),
  async (req: AuthRequest, res) => {
    try {
      const locationId = req.params.locationId as string;
      const email = req.body.email as string;
      const role = req.body.role as string;
      await inviteMemberService(locationId, email, role);
      res.status(201).json({ message: "Member added successfully" });
    } catch (error: any) {
      console.error('ADD member error:', error)
      res.status(500).json({
        message: error?.message || "Failed to add member",
      });
    }
  }
);

export default router;