// controllers/authController.js
import bcrypt from "bcrypt";
import User from "../models/User.js";
import { validationResult } from "express-validator";
import { StatusCodes } from "http-status-codes";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { sendOTPEmail } from "../utils/email.js";
import { createToken } from "../utils/token.js";
import { verifyToken } from "../utils/token.js";


export const signup = async (req, res) => {


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

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "User not found" });
    }

    if (!user.emailVerified) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "Please verify your email before logging in.",
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Invalid credentials" });
    }

    // Update the last login time
    user.lastLogin = new Date();
    await user.save();

    // Generate the JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(StatusCodes.OK).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        lastLogin: user.lastLogin, // Return the updated last login time
      },
    });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Login failed", error: error.message });
  }
};

export const getUserAnalytics = async (req, res) => {
  try {
    const now = new Date();
    const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

    // Total users
    const totalUsers = await User.countDocuments();

    // New users
    const dailyNewUsers = await User.countDocuments({ createdAt: { $gte: oneDayAgo } });
    const weeklyNewUsers = await User.countDocuments({ createdAt: { $gte: oneWeekAgo } });
    const monthlyNewUsers = await User.countDocuments({ createdAt: { $gte: oneMonthAgo } });

    // Active users
    const dailyActiveUsers = await User.countDocuments({ lastLogin: { $gte: oneDayAgo } });
    const weeklyActiveUsers = await User.countDocuments({ lastLogin: { $gte: oneWeekAgo } });
    const monthlyActiveUsers = await User.countDocuments({ lastLogin: { $gte: oneMonthAgo } });

    res.status(200).json({
      totalUsers,
      dailyNewUsers,
      weeklyNewUsers,
      monthlyNewUsers,
      dailyActiveUsers,
      weeklyActiveUsers,
      monthlyActiveUsers,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching analytics data", error: error.message });
  }
};






// export const getUserAnalytics = async (req, res) => {
//   try {
//     const totalUsers = await User.countDocuments()

//     const now = new Date()
//     const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000)
//     const oneWeekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000)
//     const oneMonthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000)

//     const dailyUsers = await User.countDocuments({ createdAt: { $gte: oneDayAgo } })
//     const weeklyUsers = await User.countDocuments({ createdAt: { $gte: oneWeekAgo } })
//     const monthlyUsers = await User.countDocuments({ createdAt: { $gte: oneMonthAgo } })

//     res.status(StatusCodes.OK).json({
//       totalUsers,
//       dailyUsers,
//       weeklyUsers,
//       monthlyUsers,
//     })
//   } catch (error) {
//     res
//       .status(StatusCodes.INTERNAL_SERVER_ERROR)
//       .json({ message: "Error fetching user analytics", error: error.message })
//   }
// }






// export const login = async (req, res) => {
//     const { email, password } = req.body;

//     try {
//         // Find user by email
//         const user = await User.findOne({ email });
//         if (!user) {
//             return res.status(StatusCodes.NOT_FOUND).json({ message: "User not found" });
//         }

//         // Check if email is verified
//         if (!user.emailVerified) {
//             return res.status(StatusCodes.UNAUTHORIZED).json({
//                 message: "Please verify your email before logging in.",
//             });
//         }

//         // Check password
//         const isPasswordMatch = await bcrypt.compare(password, user.password);
//         if (!isPasswordMatch) {
//             return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Invalid credentials" });
//         }

//         // Generate JWT
//         const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

//         res.status(StatusCodes.OK).json({ message: "Login successful", token });
//     } catch (error) {
//         res
//             .status(StatusCodes.INTERNAL_SERVER_ERROR)
//             .json({ message: "Login failed", error: error.message });
//     }
// };


// import bcrypt from "bcrypt";
// import User from "../models/User.js";
// import { validationResult } from "express-validator";
// import { StatusCodes } from "http-status-codes";

// export const signup = async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//         return res.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
//     }

//     const { firstName, lastName, email, password } = req.body;

//     try {
//         // Check if user already exists
//         const existingUser = await User.findOne({ email });
//         if (existingUser) {
//             return res
//                 .status(StatusCodes.CONFLICT)
//                 .json({ message: "User with this email already exists" });
//         }

//         // Hash password
//         const hashedPassword = await bcrypt.hash(password, 10);

//         // Create user
//         const newUser = new User({
//             firstName,
//             lastName,
//             email,
//             password: hashedPassword,
//             isVerified: true, // Automatically mark as verified since we removed email verification
//         });

//         await newUser.save();

//         res.status(StatusCodes.CREATED).json({
//             message: "Signup successful.",
//         });
//     } catch (error) {
//         res
//             .status(StatusCodes.INTERNAL_SERVER_ERROR)
//             .json({ message: "Signup failed", error: error.message });
//     }
// };