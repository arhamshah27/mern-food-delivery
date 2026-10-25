const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

const {
    getInviteDetails,
    acceptInvite,
    applyPartner,
} = require("../controllers/onboardController");

// Public endpoints for onboarding
router.get("/invite/:token", getInviteDetails);
router.post("/accept", acceptInvite);
router.post(
    "/partner/apply",
    upload.fields([
        { name: "licence", maxCount: 1 },
        { name: "id_proof", maxCount: 1 },
        { name: "photo", maxCount: 1 },
    ]),
    applyPartner
);

module.exports = router;
