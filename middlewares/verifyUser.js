// middleware/verifyUser
import User from "../models/User.js"

export const verifyUserId = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Attach user data to the request
        req.user = user;
        next();
    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};
