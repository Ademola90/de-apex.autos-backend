//routes/accessoryManagement.route.js


import express from "express"
import {
    addAccessory,
    getAccessories,
    getAccessoryById,
    updateAccessory,
    deleteAccessory,
    updateAccessoryInventory,
} from "../controllers/accessoryController.js"
import { authorizeRoles } from "../middlewares/role.js"
import { authenticateJWT } from "../middlewares/auth.js"
import upload from "../middlewares/multer.js"
import multer from "multer"

const router = express.Router()

// Only apply authentication to routes that need it, not to public routes
// router.use(authenticateJWT); - Remove this line to not apply authentication to all routes

function multerErrorHandler(err, req, res, next) {
    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_UNEXPECTED_FILE") {
            return res.status(400).json({
                message: "Too many files uploaded. Maximum limit is 10.",
            })
        }
        return res.status(400).json({ message: err.message })
    }
    next(err)
}

// Add a new accessory - requires authentication
router.post(
    "/accessories",
    authenticateJWT,
    authorizeRoles("admin", "superadmin"),
    upload.array("images", 10),
    addAccessory,
)

// Get all accessories - public route, no authentication needed
router.get("/accessories", getAccessories)

// Get accessory by ID - public route, no authentication needed
router.get("/accessories/:id", getAccessoryById)

// Update accessory by ID - requires authentication
router.put(
    "/accessories/:id",
    authenticateJWT,
    authorizeRoles("admin", "superadmin"),
    upload.array("images", 10),
    updateAccessory,
)

// Update accessory inventory - requires authentication
router.put(
    "/accessories/:id/inventory",
    authenticateJWT,
    authorizeRoles("admin", "superadmin"),
    updateAccessoryInventory,
)

// Delete accessory by ID - requires authentication
router.delete("/accessories/:id", authenticateJWT, authorizeRoles("admin", "superadmin"), deleteAccessory)

router.use(multerErrorHandler)

export default router








// import express from "express";
// import {
//     addAccessory,
//     getAccessories,
//     getAccessoryById,
//     updateAccessory,
//     deleteAccessory,
//     updateAccessoryInventory,
// } from "../controllers/accessoryController.js";
// import { authorizeRoles } from "../middlewares/role.js";
// import { authenticateJWT } from "../middlewares/auth.js";
// import upload from "../middlewares/multer.js";
// import multer from "multer";

// const router = express.Router();

// router.use(authenticateJWT);

// function multerErrorHandler(err, req, res, next) {
//     if (err instanceof multer.MulterError) {
//         if (err.code === "LIMIT_UNEXPECTED_FILE") {
//             return res.status(400).json({
//                 message: "Too many files uploaded. Maximum limit is 10.",
//             });
//         }
//         return res.status(400).json({ message: err.message });
//     }
//     next(err);
// }

// // Add a new accessory
// router.post(
//     "/accessories",
//     authenticateJWT,
//     authorizeRoles("admin", "superadmin"),
//     upload.array("images", 10),
//     addAccessory
// );

// // router.post(
// //     "/accessories",
// //     authorizeRoles("admin", "superadmin"),
// //     upload.array("images", 10),
// //     addAccessory
// // );

// // Get all accessories
// router.get("/accessories", getAccessories);

// // Get accessory by ID
// router.get("/accessories/:id", getAccessoryById);

// // Update accessory by ID
// router.put(
//     "/accessories/:id",
//     authorizeRoles("admin", "superadmin"),
//     upload.array("images", 10),
//     updateAccessory
// );

// // Update accessory inventory
// router.put(
//     "/accessories/:id/inventory",
//     authorizeRoles("admin", "superadmin"),
//     updateAccessoryInventory
// );
// // router.put(
// //     "/accessories/:id/inventory",
// //     authorizeRoles("admin", "superadmin"),
// //     updateAccessoryInventory
// // );


// // Delete accessory by ID
// router.delete("/accessories/:id", authorizeRoles("admin", "superadmin"), deleteAccessory);

// router.use(multerErrorHandler);

// export default router;