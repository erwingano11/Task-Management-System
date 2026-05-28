const express = require("express");
const router = express.Router();
const { authenticateToken, requireRole } = require("../middleware/auth");
const {
  getAccountInfo,
  updateAccountInfo,
  getMyWorkspaces,
  switchWorkspace,
  createWorkspace,
  getMembers,
  updateMemberRole,
  removeMember,
  inviteUser,
  getInvitations,
  revokeInvitation,
  getMyInvitation,
  acceptMyInvitation,
  validateInviteToken,
  acceptInvite,
  getProfile,
  updateProfile,
  changePassword,
} = require("../controllers/accountController");

// Public routes (no auth needed)
router.get("/accept-invite", validateInviteToken);
router.post("/accept-invite", acceptInvite);

// Authenticated routes
router.use(authenticateToken);

router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.put("/password", changePassword);

// Account workspace info
router.get("/info", getAccountInfo);
router.put("/info", requireRole("admin"), updateAccountInfo);

// Multi-workspace
router.get("/my-workspaces", getMyWorkspaces);
router.post("/switch/:accountId", switchWorkspace);
router.post("/workspaces", createWorkspace);

// Members — any authenticated user can view
router.get("/members", getMembers);
router.get("/my-invitation", getMyInvitation);
router.post("/my-invitation/:id/accept", acceptMyInvitation);

// Admin + Manager only
router.post("/invite", requireRole("admin", "manager"), inviteUser);
router.get("/invitations", requireRole("admin", "manager"), getInvitations);
router.delete(
  "/invitations/:id",
  requireRole("admin", "manager"),
  revokeInvitation,
);

// Admin only
router.put("/members/:id/role", requireRole("admin"), updateMemberRole);
router.delete("/members/:id", requireRole("admin"), removeMember);

module.exports = router;
