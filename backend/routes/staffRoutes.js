const express = require("express");
const router = express.Router();
const {
    getStaff,
    inviteManager,
    resendInvite,
    updateStaffStatus,
    getPartnerApplications,
    approvePartner,
    rejectPartner,
} = require("../controllers/staffController");
const { protect, authorize, requireRole } = require("../middlewares/authMiddleware");

// Staff directory and status
router.get("/", protect, authorize("staff:read"), getStaff);
router.patch("/:id/status", protect, authorize("staff:read"), updateStaffStatus);

// Manager invitations (Owner only)
router.post("/invite", protect, requireRole("owner", "admin"), inviteManager);
router.post("/:id/resend-invite", protect, requireRole("owner", "admin"), resendInvite);

// Delivery partner application reviews
router.get("/partners/applications", protect, authorize("partners:review"), getPartnerApplications);
router.patch("/partners/:id/approve", protect, authorize("partners:review"), approvePartner);
router.patch("/partners/:id/reject", protect, authorize("partners:review"), rejectPartner);

module.exports = router;
