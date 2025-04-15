// routes/carmanagement.route.js

import express from "express"
import { addCar, getCars, updateCar, deleteCar, getCarById } from "../controllers/carController.js"
import { authorizeRoles } from "../middlewares/role.js"
import { authenticateJWT } from "../middlewares/auth.js"
import upload from "../middlewares/multer.js"
import multer from "multer"
import Car from "../models/Car.js"

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

// Add a new car - requires authentication
router.post("/cars", authenticateJWT, authorizeRoles("admin", "superadmin"), upload.array("images"), addCar)

// Get all cars - public route, no authentication needed
router.get("/cars", getCars)

// Get car by ID - public route, no authentication needed
router.get("/cars/:id", getCarById)

// Update car by ID - requires authentication
router.put("/cars/:id", authenticateJWT, authorizeRoles("admin", "superadmin"), upload.array("images", 10), updateCar)

// Delete car by ID - requires authentication
router.delete("/cars/:id", authenticateJWT, authorizeRoles("admin", "superadmin"), deleteCar)

// Get public cars (filtered by make and model) - public route, no authentication needed
router.get("/public-cars", async (req, res) => {
    const { make, model } = req.query

    const filter = {}
    if (make) filter.make = new RegExp(make, "i") // Case-insensitive match
    if (model) filter.model = new RegExp(model, "i")

    try {
        const cars = await Car.find(filter).select("-createdBy") // Fetch all cars

        res.status(200).json({
            success: true,
            cars, // Return all cars
        })
    } catch (error) {
        console.error("Error fetching public cars:", error)
        res.status(500).json({
            success: false,
            message: "Error fetching public cars",
            error: error.message,
        })
    }
})

router.use(multerErrorHandler)

export default router










// import express from "express";
// import {
//     addCar,
//     getCars,
//     updateCar,
//     deleteCar,
//     getCarById,
// } from "../controllers/carController.js";
// import { authorizeRoles } from "../middlewares/role.js";
// import { authenticateJWT } from "../middlewares/auth.js";
// import upload from "../middlewares/multer.js";
// import multer from "multer";
// import Car from "../models/Car.js";

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



// // Add a new car
// router.post(
//     "/cars",
//     authorizeRoles("admin", "superadmin"),
//     upload.array("images"),
//     addCar
// );

// // Get all cars
// router.get("/cars", getCars);

// // Get car by ID
// router.get("/cars/:id", getCarById);



// // Update car by ID
// router.put(
//     "/cars/:id",
//     authorizeRoles("admin", "superadmin"),
//     upload.array("images", 10),
//     updateCar
// );


// // Delete car by ID
// router.delete("/cars/:id", authorizeRoles("admin", "superadmin"), deleteCar);




// // Get public cars (filtered by make and model)
// router.get("/public-cars", async (req, res) => {
//     const { make, model } = req.query;

//     const filter = {};
//     if (make) filter.make = new RegExp(make, "i"); // Case-insensitive match
//     if (model) filter.model = new RegExp(model, "i");

//     try {
//         const cars = await Car.find(filter).select("-createdBy"); // Fetch all cars

//         res.status(200).json({
//             success: true,
//             cars, // Return all cars
//         });
//     } catch (error) {
//         console.error("Error fetching public cars:", error);
//         res.status(500).json({
//             success: false,
//             message: "Error fetching public cars",
//             error: error.message,
//         });
//     }
// });


// router.use(multerErrorHandler);

// export default router;




