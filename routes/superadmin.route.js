
// routes/superadmin.route.js
import express from "express"
import { authenticateJWT } from "../middlewares/auth.js"
import { authorizeRoles } from "../middlewares/role.js";
import { createAdmin } from "../controllers/adminController.js";
import { createSuperadmin } from "../controllers/superadminController.js";



const router = express.Router()

// Route to create the first super admin (one-time setup, should be secured or removed after initial setup)
router.post("/create-super-admin", createSuperadmin)

// Route to create admin (accessible only by super admin)
router.post("/create-admin", authenticateJWT, authorizeRoles("superadmin"), createAdmin)

export default router

