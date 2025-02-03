// models/User.js

import mongoose from "mongoose"

const userSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    email: { type: String, unique: true },
    password: String,
    emailVerified: { type: Boolean, default: false },
    otp: String,
    otpExpiry: Date,
    createdAt: { type: Date, default: Date.now },
    lastLogin: { type: Date, default: null, index: true },
    loginCount: { type: Number, default: 0 },
  },
  { timestamps: true },
)

const User = mongoose.model("User", userSchema)
export default User


// import mongoose from "mongoose";

// const userSchema = new mongoose.Schema(
//     {
//         firstName: String,
//         lastName: String,
//         email: { type: String, unique: true },
//         password: String,
//         emailVerified: { type: Boolean, default: false },
//         otp: String, // Add this field
//         otpExpiry: Date, // Optional: To handle OTP expiration
//     },
//     { timestamps: true }
// );

// const User = mongoose.model("User", userSchema);
// export default User;
