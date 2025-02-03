
// routes/authRoute.js
import express from "express";
import { signupLimiter } from "../middlewares/rateLimiter.js";
import { signup, verifyOTP, login, resendOTP, getUserAnalytics } from "../controllers/authController.js";
import { signupValidation } from "../middlewares/signupValidation.js";
import { authenticateJWT } from "../middlewares/auth.js";
import { jwtDecode } from "../middlewares/jwtDecode.js";

const router = express.Router();

// Signup route
router.post("/signup", signupLimiter, signupValidation, signup);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);
router.post("/login", login);
router.get("/user-analytics", authenticateJWT, (req, res) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: "Request body is empty or invalid" });
    }

    // Example response data (replace this with actual analytics logic)
    const analytics = {
        user: req.user,
        totalUsers: 100,
        activeUsers: 50,
    };

    res.status(200).json(analytics);
});
router.get("/protected-route", authenticateJWT, jwtDecode, (req, res) => {
    res.status(200).json({
        message: "Access granted",
        user: req.user,
    });
});

export default router;


// import express from "express"
// import { signupLimiter } from "../middlewares/rateLimiter.js"
// import { signup, verifyOTP, login, resendOTP, getUserAnalytics } from "../controllers/authController.js"
// import { signupValidation } from "../middlewares/signupValidation.js"
// import { authenticateJWT } from "../middlewares/auth.js"
// import { verifyUserId } from "../middlewares/verifyUser.js";


// const router = express.Router()

// // Signup route
// router.post("/signup", signupLimiter, signupValidation, signup)
// router.post("/verify-otp", verifyOTP)
// router.post("/resend-otp", resendOTP)
// router.post("/login", login)
// router.get("/user-analytics", authenticateJWT, getUserAnalytics)
// router.get("/protected-route", authenticateJWT, verifyUserId, (req, res) => {
//     res.status(200).json({
//         message: "Access granted",
//         user: req.user,
//     });
// });

// export default router




// import express from "express";
// import { signupLimiter } from "../../middlewares/rateLimiter.js";
// import { signup, verifyOTP, login, resendOTP } from "../controllers/authController.js";
// import { signupValidation } from "../../middlewares/signupValidation.js";

// const router = express.Router();

// // Signup route
// router.post("/signup", signupLimiter, signupValidation, signup);
// router.post("/verify-otp", verifyOTP);
// router.post("/resend-otp", resendOTP);
// router.post("/login", login);

// export default router;


