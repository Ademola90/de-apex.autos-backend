// middlewares/rateLimiter.js
import rateLimit from "express-rate-limit";

export const signupLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 requests per 15 minutes
    message: { message: "Too many signup attempts, please try again later." },
});