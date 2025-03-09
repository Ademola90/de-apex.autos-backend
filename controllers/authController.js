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
import { OAuth2Client } from "google-auth-library";


const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);




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




// Request Password Reset
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "User not found" });
    }

    // Generate OTP and send it to user's email
    const tokenResponse = await createToken(user, "resetPassword", 1); // OTP valid for 1 hour
    if (tokenResponse.status) {
      const { data: token } = tokenResponse;

      await sendOTPEmail(email, token);
      return res.status(StatusCodes.OK).json({
        message: "Password reset OTP sent to your email.",
      });
    } else {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Error generating OTP", error: tokenResponse.message });
    }
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Failed to send reset password OTP",
      error: error.message,
    });
  }
};



// Verify OTP and Reset Password
export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    // Verify OTP
    const tokenResponse = await verifyToken(otp, email, "resetPassword");
    if (!tokenResponse.status) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: tokenResponse.message });
    }

    // Get user and update password
    const user = tokenResponse.data;
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(StatusCodes.OK).json({
      message: "Password reset successfully. You can now log in with the new password.",
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Failed to reset password",
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






export const googleAuth = async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    let user = await User.findOne({ email: payload.email });
    if (!user) {
      user = new User({
        name: payload.name,
        email: payload.email,
        googleId: payload.sub,
        avatar: payload.picture,
        role: "user",
      });
      await user.save();
    }

    const accessToken = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );
    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    user.lastLogin = new Date();
    await user.save();

    res.status(200).json({
      message: "Login successful",
      token: accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    console.error("Google authentication error:", error.message);
    res.status(500).json({ error: "Failed to authenticate" });
  }
};





export const googleLogin = async (req, res) => {
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
      user = new User({ email, name, googleId: payload.sub, role: "user" });
      await user.save();
    }

    // Generate access token
    const accessToken = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" } // Short-lived access token
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" } // Long-lived refresh token
    );

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Send response with tokens and user details
    res.status(200).json({
      message: "Login successful",
      token: accessToken, // Access token
      refreshToken, // Refresh token
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    console.error("Google authentication error:", error.message);
    res.status(500).json({
      message: "Google authentication failed",
      error: error.message,
    });
  }
};

// export const googleLogin = async (req, res) => {
//   const { token } = req.body;

//   try {
//     const ticket = await client.verifyIdToken({
//       idToken: token,
//       audience: process.env.GOOGLE_CLIENT_ID,
//     });
//     const payload = ticket.getPayload();
//     const { email, name } = payload;

//     let user = await User.findOne({ email });
//     if (!user) {
//       user = new User({ email, name, googleId: payload.sub });
//       await user.save();
//     }

//     const jwtToken = jwt.sign(
//       { userId: user._id, email: user.email },
//       process.env.JWT_SECRET,
//       { expiresIn: "1h" }
//     );

//     res.status(200).json({
//       message: "Login successful",
//       token: jwtToken,
//       user: { id: user._id, email: user.email, name: user.name },
//     });
//   } catch (error) {
//     console.error("Google authentication error:", error.message);
//     res.status(500).json({
//       message: "Google authentication failed",
//       error: error.message,
//     });
//   }
// };





// export const googleLogin = async (req, res) => {
//   const { token } = req.body;

//   try {
//     // Verify the Google token
//     const ticket = await client.verifyIdToken({
//       idToken: token,
//       audience: process.env.GOOGLE_CLIENT_ID,
//     });

//     const payload = ticket.getPayload();
//     const { sub: googleId, email, name, picture } = payload;

//     // Check if the user already exists in your database
//     let user = await User.findOne({ email });

//     if (!user) {
//       // If the user doesn't exist, create a new user
//       user = new User({
//         firstName: name.split(" ")[0],
//         lastName: name.split(" ")[1] || "",
//         email,
//         googleId, // Save Google ID for future logins
//         emailVerified: true, // Mark email as verified since it's from Google
//         role: "user", // Assign a default role
//       });

//       await user.save();
//     }

//     // Generate a JWT token for the user
//     const jwtToken = jwt.sign(
//       {
//         userId: user._id,
//         email: user.email,
//         role: user.role,
//       },
//       process.env.JWT_SECRET,
//       { expiresIn: "1h" }
//     );

//     // Update the user's last login
//     user.lastLogin = new Date();
//     await user.save();

//     // Send the response with the token and user details
//     res.status(200).json({
//       message: "Google login successful",
//       token: jwtToken,
//       user: {
//         id: user._id,
//         email: user.email,
//         firstName: user.firstName,
//         lastName: user.lastName,
//         role: user.role,
//         lastLogin: user.lastLogin,
//       },
//     });
//   } catch (error) {
//     console.error("Google login error:", error);
//     res.status(500).json({
//       message: "Google login failed",
//       error: error.message,
//     });
//   }
// };



