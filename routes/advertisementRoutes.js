import express from "express"
import {
    createAdvertisement,
    getAllAdvertisements,
    getAdvertisementById,
    updateAdvertisement,
    deleteAdvertisement,
    getAdvertisementsForPage,
    trackAdClick,
    trackAdImpression,
} from "../controllers/advertisementController.js"
import { authenticateJWT } from "../middlewares/auth.js"
import { authorizeRoles } from "../middlewares/role.js"
import upload from "../middlewares/multer.js"

const router = express.Router()

// Public routes
router.get("/for-page", getAdvertisementsForPage)
router.put("/track-click/:id", trackAdClick)
router.put("/track-impression/:id", trackAdImpression)

// Protected routes
router.use(authenticateJWT)

// Admin only routes
router.post("/", authorizeRoles("admin", "superadmin"), upload.single("image"), createAdvertisement)

router.get("/", authorizeRoles("admin", "superadmin"), getAllAdvertisements)

router.get("/:id", authorizeRoles("admin", "superadmin"), getAdvertisementById)

router.put("/:id", authorizeRoles("admin", "superadmin"), upload.single("image"), updateAdvertisement)

router.delete("/:id", authorizeRoles("admin", "superadmin"), deleteAdvertisement)

export default router
