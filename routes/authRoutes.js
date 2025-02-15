
//routes/authRoute.js

// routes/authRoute.js
import express from "express";
import { signupLimiter } from "../middlewares/rateLimiter.js";
import {
    signup,
    verifyOTP,
    login,
    resendOTP,
    getLoginAnalysis
} from "../controllers/authController.js";
import { signupValidation } from "../middlewares/signupValidation.js";
import { authenticateJWT, refreshAccessToken } from "../middlewares/auth.js";
import { verifyUserId } from "../middlewares/verifyUser.js";
import { getUserStats } from "../controllers/userStatsController.js";
import { authorizeRoles } from "../middlewares/role.js";

const router = express.Router();

// Signup and login routes
router.post("/signup", signupLimiter, signupValidation, signup);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);
router.post("/login", login);

// Refresh token endpoint
router.post("/refresh-token", refreshAccessToken);

// Protected routes
router.get(
    "/login-analysis",
    authenticateJWT,
    authorizeRoles("admin", "superadmin"),
    getLoginAnalysis
);

router.get("/user-analytics", authenticateJWT, (req, res) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: "Request body is empty or invalid" });
    }

    const analytics = {
        user: req.user,
        totalUsers: 100,
        activeUsers: 50,
    };

    res.status(200).json(analytics);
});

router.get("/protected-route", authenticateJWT, verifyUserId, (req, res) => {
    res.status(200).json({
        message: "Access granted",
        user: req.user,
    });
});

export default router;



///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// import express from "express";
// import { signupLimiter } from "../middlewares/rateLimiter.js";
// import { signup, verifyOTP, login, resendOTP, getLoginAnalysis } from "../controllers/authController.js";
// import { signupValidation } from "../middlewares/signupValidation.js";
// import { authenticateJWT } from "../middlewares/auth.js";
// import { verifyUserId } from "../middlewares/verifyUser.js";
// import { getUserStats } from "../controllers/userStatsController.js";
// import { authorizeRoles } from "../middlewares/role.js";

// const router = express.Router();

// // Signup route
// router.post("/signup", signupLimiter, signupValidation, signup);
// router.post("/verify-otp", verifyOTP);
// router.post("/resend-otp", resendOTP);
// router.post("/login", login);
// router.get("/login-analysis", authenticateJWT, authorizeRoles("admin", "superadmin"), getLoginAnalysis)
// router.get("/user-analytics", authenticateJWT, (req, res) => {
//     if (!req.body || Object.keys(req.body).length === 0) {
//         return res.status(400).json({ message: "Request body is empty or invalid" });
//     }

//     // Example response data (replace this with actual analytics logic)
//     const analytics = {
//         user: req.user,
//         totalUsers: 100,
//         activeUsers: 50,
//     };

//     res.status(200).json(analytics);
// });
// router.get("/protected-route", authenticateJWT, verifyUserId, (req, res) => {
//     res.status(200).json({
//         message: "Access granted",
//         user: req.user,
//     });
// });

// export default router;





