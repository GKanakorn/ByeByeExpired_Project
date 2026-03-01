import express from "express";
import {
  getLocationMembers,
  updateMemberRoleService,
  deleteMemberService,
  inviteMemberService,
} from "../services/manageLocation.service";

const router = express.Router();

router.get("/locations/:locationId/members", async (req, res) => {
  try {
    const { locationId } = req.params;

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
  async (req, res) => {
    try {
      const { locationId, memberId } = req.params;
      const { role } = req.body;
      await updateMemberRoleService(locationId, memberId, role);
      res.status(200).json({ message: "Role updated" });
    } catch (error) {
      res.status(500).json({ error: "Failed to update role" });
    }
  }
);

router.delete(
  "/locations/:locationId/members/:memberId",
  async (req, res) => {
    try {
      const { locationId, memberId } = req.params;
      await deleteMemberService(locationId, memberId);
      res.status(200).json({ message: "Member deleted" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete member" });
    }
  }
);

router.post(
  "/locations/:locationId/members",
  async (req, res) => {
    try {
      const { locationId } = req.params;
      const { email, role } = req.body;
      await inviteMemberService(locationId, email, role);
      res.status(201).json({ message: "Member invited" });
    } catch (error) {
      res.status(500).json({ error: "Failed to invite member" });
    }
  }
);

export default router;