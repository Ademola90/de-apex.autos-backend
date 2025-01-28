// auth-service/models/Token.js
import mongoose from "mongoose";


const tokenSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Link to User model
        token: { type: String, required: true }, // Store the generated token
        type: { type: String, required: true }, // Type of token, e.g., 'verifyEmail', 'resetPassword'
        expiresAt: { type: Date, required: true }, // Expiry time for the token
        data: { type: mongoose.Schema.Types.Mixed, default: null }, // Optional additional data
    },
    { timestamps: true } // Automatically handle createdAt and updatedAt fields
);

const Token = mongoose.model("Token", tokenSchema);
export default Token;
