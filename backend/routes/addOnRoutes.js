const express = require("express");
const router = express.Router();
const {
    getAddOns,
    getAddOnById,
    createAddOn,
    updateAddOn,
    deleteAddOn,
} = require("../controllers/addOnController");
const { protect, adminOnly } = require("../middlewares/authMiddleware");

router.get("/", getAddOns);
router.get("/:id", getAddOnById);

// Admin-only routes
router.post("/", protect, adminOnly, createAddOn);
router.put("/:id", protect, adminOnly, updateAddOn);
router.delete("/:id", protect, adminOnly, deleteAddOn);

module.exports = router;
