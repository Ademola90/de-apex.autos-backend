import express from "express";
import { authenticateJWT } from "../middlewares/auth.js";
import { authorizeRoles } from "../middlewares/role.js";
import upload from "../middlewares/multer.js";
import {
    addCarHire,
    getAllCars,
    getCarById,
    updateCar,
    deleteCar,
    updateCarStatus,
    deleteCarImage,
} from "../controllers/carHireController.js";
import {
    createBooking,
    getAllBookings,
    getBookingById,
    updateBookingStatus,
    updatePaymentStatus,
    cancelBooking,
    getBookingStats,
    getCarHireAnalytics,
} from "../controllers/CarHireBookingController.js";


const router = express.Router();

// Car routes
router.post(
    "/cars",
    authenticateJWT,
    authorizeRoles("admin", "superadmin"),
    upload.array("images", 10),
    addCarHire
);

router.get("/cars", getAllCars);
router.get("/cars/:id", getCarById);

router.put(
    "/cars/:id",
    authenticateJWT,
    authorizeRoles("admin", "superadmin"),
    upload.array("images", 10),
    updateCar
);

router.delete(
    "/cars/:id",
    authenticateJWT,
    authorizeRoles("admin", "superadmin"),
    deleteCar
);

router.patch(
    "/cars/:id/status",
    authenticateJWT,
    authorizeRoles("admin", "superadmin"),
    updateCarStatus
);

router.delete(
    "/cars/:id/images/:imageId",
    authenticateJWT,
    authorizeRoles("admin", "superadmin"),
    deleteCarImage
);

// Booking routes
router.post(
    "/bookings",
    authenticateJWT,
    createBooking
);

router.get(
    "/bookings",
    authenticateJWT,
    getAllBookings
);

router.get(
    "/bookings/:id",
    authenticateJWT,
    getBookingById
);

router.patch(
    "/bookings/:id/status",
    authenticateJWT,
    authorizeRoles("admin", "superadmin"),
    updateBookingStatus
);

router.patch(
    "/bookings/:id/payment",
    authenticateJWT,
    authorizeRoles("admin", "superadmin"),
    updatePaymentStatus
);

router.patch(
    "/bookings/:id/cancel",
    authenticateJWT,
    cancelBooking
);

// Analytics routes
router.get(
    "/stats/bookings",
    authenticateJWT,
    authorizeRoles("admin", "superadmin"),
    getBookingStats
);

router.get(
    "/stats/cars",
    authenticateJWT,
    authorizeRoles("admin", "superadmin"),
    getCarHireAnalytics
);

export default router;