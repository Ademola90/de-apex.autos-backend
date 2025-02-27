//models/User.js

import mongoose from "mongoose";
import bcrypt from "bcrypt";

// Define the User Schema for both normal users and admins
const userSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      // required: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    googleId: {
      type: String,
      unique: true
    },
    otp: String,
    otpExpiry: Date,
    createdAt: {
      type: Date,
      default: Date.now,
    },
    lastLogin: {
      type: Date,
      default: null,
      index: true,
    },
    loginCount: {
      type: Number,
      default: 0,
    },
    role: {
      type: String,
      enum: ["superadmin", "admin", "user"],
      default: "user",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }, // To track who created this admin
  },
  { timestamps: true }
);


// Method to compare entered password with stored password (useful for login)
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;


