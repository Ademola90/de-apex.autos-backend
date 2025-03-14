// routes/carmanagement.route.js
import express from "express";
import {
    addCar,
    getCars,
    updateCar,
    deleteCar,
    getCarById,
} from "../controllers/carController.js";
import { authorizeRoles } from "../middlewares/role.js";
import { authenticateJWT } from "../middlewares/auth.js";
import upload from "../middlewares/multer.js";
import multer from "multer";
import Car from "../models/Car.js";

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



// Add a new car
router.post(
    "/cars",
    authorizeRoles("admin", "superadmin"),
    upload.array("images"),
    addCar
);

// Get all cars
router.get("/cars", getCars);

// Get car by ID
router.get("/cars/:id", getCarById);



// Update car by ID
router.put(
    "/cars/:id",
    authorizeRoles("admin", "superadmin"),
    upload.array("images", 10),
    updateCar
);


// Delete car by ID
router.delete("/cars/:id", authorizeRoles("admin", "superadmin"), deleteCar);




// Get public cars (filtered by make and model)
router.get("/public-cars", async (req, res) => {
    const { make, model } = req.query;

    const filter = {};
    if (make) filter.make = new RegExp(make, "i"); // Case-insensitive match
    if (model) filter.model = new RegExp(model, "i");

    try {
        const cars = await Car.find(filter).select("-createdBy"); // Fetch all cars

        res.status(200).json({
            success: true,
            cars, // Return all cars
        });
    } catch (error) {
        console.error("Error fetching public cars:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching public cars",
            error: error.message,
        });
    }
});


router.use(multerErrorHandler);

export default router;



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




// import express from "express";
// import {
//     addCar,
//     getCars,
//     updateCar,
//     deleteCar,
// } from "../controllers/carController.js";
// import { authorizeRoles } from "../middlewares/role.js";
// import { authenticateJWT } from "../middlewares/auth.js";
// import upload from "../middlewares/multer.js";
// import multer from "multer";
// import Car from "../models/Car.js";

// const router = express.Router();

// // Authenticate all routes
// router.use(authenticateJWT);

// // Custom error handler for Multer errors
// function multerErrorHandler(err, req, res, next) {
//     if (err instanceof multer.MulterError) {
//         // Handle Multer-specific errors
//         if (err.code === "LIMIT_UNEXPECTED_FILE") {
//             return res.status(400).json({ message: "Too many files uploaded. Maximum limit is 10." });
//         }
//         return res.status(400).json({ message: err.message });
//     }

//     // Pass to the default error handler if not Multer error
//     next(err);
// }

// // Add a new car (Admin and Super Admin only)
// router.post(
//     "/cars",
//     authorizeRoles("admin", "superadmin"),
//     upload.array("images", 10), // Multer for handling file uploads
//     addCar
// );

// // Get all cars (Admin and Super Admin only)
// router.get("/cars", authorizeRoles("admin", "superadmin"), getCars);

// // Update a car (Admin and Super Admin only)
// router.put(
//     "/cars/:id",
//     authorizeRoles("admin", "superadmin"),
//     upload.array("images", 10), // Multer for updating images if provided
//     updateCar
// );

// // Delete a car (Admin and Super Admin only)
// router.delete("/cars/:id", async (req, res) => {
//     try {
//         const car = await Car.findByIdAndDelete(req.params.id);
//         if (!car) {
//             return res.status(404).json({ message: "Car not found" });
//         }
//         res.json({ message: "Car deleted successfully" });
//     } catch (error) {
//         res.status(500).json({ message: "Error deleting car", error: error.message });
//     }
// });

// router.get('/public-cars', async (req, res) => {
//     try {
//         // Exclude the `createdBy` field
//         const cars = await Car.find().select('-createdBy');
//         res.status(200).json({ success: true, cars });
//     } catch (error) {
//         console.error('Error fetching public cars:', error);
//         res.status(500).json({ success: false, message: 'Error fetching public cars', error: error.message });
//     }
// });



// // Attach the Multer error handler to the routes
// router.use(multerErrorHandler);

// export default router;


