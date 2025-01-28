//auth-service/utils/token.js
import Token from "../models/Token.js";
import User from "../models/User.js";
import rs from "randomstring";

const generateToken = async () => {
    try {
        const options = { charset: "numeric", length: 6 };
        let token, checkToken;
        do {
            token = rs.generate(options);
            checkToken = await Token.findOne({ token });
        } while (checkToken);
        return { status: true, message: "Token Generated", data: token };
    } catch (error) {
        return { status: false, message: error.message, data: null };
    }
};

const createToken = async (user, type, hours, data = null) => {
    try {
        // Generate new OTP
        const token = await generateToken();

        // Delete all expired tokens for this user and type
        await Token.deleteMany({
            user: user._id,
            type,
            expiresAt: { $lte: new Date() }, // Remove only expired tokens
        });

        // Create a new token
        await Token.create({
            user: user._id,
            type,
            token: token.data,
            expiresAt: new Date(Date.now() + hours * 60 * 60 * 1000),
            data,
        });

        return { status: true, message: "Token Created", data: token.data };
    } catch (error) {
        return { status: false, message: error.message, data: null };
    }
};

const verifyToken = async (token, email, type) => {
    try {
        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) return { status: false, message: "User not found", data: null };

        // Find the token in the database
        const foundToken = await Token.findOne({
            user: user._id,
            token,
            type,
        });

        if (!foundToken) return { status: false, message: "Invalid token", data: null };

        // Check if token has expired
        if (Date.now() > new Date(foundToken.expiresAt).getTime()) {
            await Token.deleteOne({ _id: foundToken._id }); // Cleanup expired token
            return { status: false, message: "Token expired", data: null };
        }

        // Delete the token after verification
        await Token.deleteMany({ user: user._id, type });

        return { status: true, message: "Token verified", data: user };
    } catch (error) {
        return { status: false, message: error.message, data: null };
    }
};


export { createToken, verifyToken };
