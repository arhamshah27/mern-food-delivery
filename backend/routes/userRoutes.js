const express = require("express");
const router = express.Router();

const {
    getProfile,
    updateProfile,
    updateProfileImage,
    deleteAccount,
} = require("../controllers/userController");
const { protect } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

// All user routes require authentication
router.use(protect);

router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.put("/profile/image", upload.single("profileImage"), updateProfileImage);
router.delete("/account", deleteAccount);

module.exports = router;
