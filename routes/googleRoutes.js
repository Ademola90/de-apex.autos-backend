import express from "express";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import User from "../models/User.js"; // Adjust path to your User model

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post("/google", async (req, res) => {
    const { token } = req.body;
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { email, name } = payload;

        let user = await User.findOne({ email });

        if (!user) {
            user = new User({ email, name });
            await user.save();
        }

        const jwtToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });

        res.status(200).json({ token: jwtToken, user });
    } catch (error) {
        console.error("Google authentication error:", error);
        res.status(500).json({ message: "Google authentication failed", error });
    }
});

export default router;
