//controllers/authController.js
import bcrypt from "bcrypt";
import User from "../models/User.js";
import { validationResult } from "express-validator";
import { StatusCodes } from "http-status-codes";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { sendOTPEmail } from "../utils/email.js";
import { createToken } from "../utils/token.js";
import { verifyToken } from "../utils/token.js";
import moment from "moment";



export const signup = async (req, res) => {
  // const errors = validationResult(req);
  // if (!errors.isEmpty()) {
  //     return res.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
  // }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { firstName, lastName, email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(StatusCodes.CONFLICT)
        .json({ message: "User with this email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user without OTP initially
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    // Generate OTP and send it to the user
    const tokenResponse = await createToken(newUser, "verifyEmail", 1); // OTP valid for 1 hour
    if (tokenResponse.status) {
      const { data: token } = tokenResponse;

      // Send OTP email directly using sendOTPEmail function
      await sendOTPEmail(email, token);

      res.status(StatusCodes.CREATED).json({
        message: "Signup successful. Please check your email for the OTP to verify your account.",
      });
    } else {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Error generating OTP", error: tokenResponse.message });
    }
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Signup failed", error: error.message });
  }
};

export const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    // Verify the token using the Token model and utility function
    const tokenResponse = await verifyToken(otp, email, "verifyEmail");
    if (!tokenResponse.status) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: tokenResponse.message });
    }

    // Get the verified user
    const user = tokenResponse.data;

    // Mark user as verified and save changes
    user.emailVerified = true;
    await user.save();

    res.status(StatusCodes.OK).json({ message: "OTP verified successfully. You can now log in." });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "OTP verification failed", error: error.message });
  }
};

export const resendOTP = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "User not found" });
    }

    // Generate new OTP and send it
    const tokenResponse = await createToken(user, "verifyEmail", 1); // Valid for 1 hour
    if (tokenResponse.status) {
      const { data: token } = tokenResponse;

      await sendOTPEmail(email, token);
      return res.status(StatusCodes.OK).json({
        message: "OTP resent successfully. Please check your email.",
      });
    } else {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Error generating OTP", error: tokenResponse.message });
    }
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Resend OTP failed", error: error.message });
  }
};


export const login = async (req, res) => {
  const { email, password } = req.body;
  console.log({ password, email })

  try {
    console.log("Login attempt for email:", email);

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      console.log(`Login attempt failed: No user found with email ${email}`);
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "Invalid credentials",
      });
    }

    console.log("User found:", user);

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    console.log("Password validation result:", isPasswordValid);

    if (!isPasswordValid) {
      console.log("Login attempt failed: Invalid password");
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "Invalid credentials",
      });
    }

    // Generate JWT token with role included
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    console.log("Generated JWT token:", token);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Send response with user details including role
    res.status(StatusCodes.OK).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "An error occurred during login",
      error: error.message,
    });
  }
};


export const getLoginAnalysis = async (req, res) => {
  try {
    // Get the current date and the date for 10 days ago
    const today = moment().endOf("day").toDate(); // Today at 23:59:59
    const tenDaysAgo = moment().subtract(10, "days").startOf("day").toDate(); // 10 days ago at 00:00

    // Aggregate to get login counts by day
    const result = await User.aggregate([
      {
        $match: {
          lastLogin: { $gte: tenDaysAgo, $lte: today }, // Filter records in the last 10 days
        },
      },
      {
        $project: {
          day: { $dateToString: { format: "%Y-%m-%d", date: "$lastLogin" } }, // Extract day part (YYYY-MM-DD)
        },
      },
      {
        $group: {
          _id: "$day", // Group by the formatted day
          loginCount: { $sum: 1 }, // Count number of logins per day
        },
      },
      {
        $sort: { _id: 1 }, // Sort by date ascending
      },
    ]);

    // Fill in missing days (e.g., if no logins for a day) with 0 logins
    const analysis = [];
    for (let i = 9; i >= 0; i--) {
      const day = moment().subtract(i, "days").format("YYYY-MM-DD");
      const dayData = result.find((r) => r._id === day);
      analysis.push({
        day,
        users: dayData ? dayData.loginCount : 0, // 0 if no users logged in on that day
      });
    }

    return res.status(200).json({ analysis });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
