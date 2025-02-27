//routes/accessoryManagement.route.js

import express from "express";
import {
    addAccessory,
    getAccessories,
    getAccessoryById,
    updateAccessory,
    deleteAccessory,
    updateAccessoryInventory,
} from "../controllers/accessoryController.js";
import { authorizeRoles } from "../middlewares/role.js";
import { authenticateJWT } from "../middlewares/auth.js";
import upload from "../middlewares/multer.js";
import multer from "multer";

const router = express.Router();

router.use(authenticateJWT);

function multerErrorHandler(err, req, res, next) {
    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_UNEXPECTED_FILE") {
            return res.status(400).json({
                message: "Too many files uploaded. Maximum limit is 10.",
            });
        }
        return res.status(400).json({ message: err.message });
    }
    next(err);
}

// Add a new accessory
router.post(
    "/accessories",
    authorizeRoles("admin", "superadmin"),
    upload.array("images", 10),
    addAccessory
);

// Get all accessories
router.get("/accessories", getAccessories);

// Get accessory by ID
router.get("/accessories/:id", getAccessoryById);

// Update accessory by ID
router.put(
    "/accessories/:id",
    authorizeRoles("admin", "superadmin"),
    upload.array("images", 10),
    updateAccessory
);

// Update accessory inventory
router.put(
    "/accessories/:id/inventory",
    authorizeRoles("admin", "superadmin"),
    updateAccessoryInventory
);


// Delete accessory by ID
router.delete("/accessories/:id", authorizeRoles("admin", "superadmin"), deleteAccessory);

router.use(multerErrorHandler);

export default router;