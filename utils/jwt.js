//auth-service/utils/jwt.js
import jwt from "jsonwebtoken";

export const verifyToken = (token, email, purpose) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.email !== email || decoded.purpose !== purpose) {
            return { status: false, message: "Invalid OTP or email mismatch" };
        }
        return { status: true, data: decoded };
    } catch (error) {
        return { status: false, message: "Invalid or expired OTP" };
    }
};
