//middlewares/verifyUser.js have been change to middlewares/jwtDecode.js
import jwt from "jsonwebtoken";
import { sendResponse, sendError } from "../utils/response.js";
import User from "../models/User.js";
// import User from "../models/user.js";

export const jwtDecode = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return sendError(res, 401, "Authorization header is required");
    }

    const token = authHeader.split(" ")[1];

    try {
        // Decode the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if the user exists
        const user = await User.findById(decoded.id);
        if (!user) {
            return sendError(res, 404, "User not found");
        }

        // Attach user info to request
        req.user = decoded;
        next();
    } catch (error) {
        sendError(res, 401, `Invalid token: ${error.message}`);
    }
};
