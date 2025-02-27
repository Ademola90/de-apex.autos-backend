// ../middlewares/auth.js

// middlewares/auth.js
import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";

// Middleware to authenticate JWT
export const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Authentication token missing or incorrect format" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Token expired" });
    }
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Invalid token" });
  }
};

// Endpoint to refresh access token
export const refreshAccessToken = (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "Refresh token is required" });
  }

  try {
    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Generate a new access token
    const newAccessToken = jwt.sign(
      { id: decoded.id, role: decoded.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" } // Set the expiration time for the new access token
    );

    // Return the new access token
    res.status(StatusCodes.OK).json({ accessToken: newAccessToken });
  } catch (err) {
    console.error("Token refresh failed:", err);
    res.status(StatusCodes.UNAUTHORIZED).json({ message: "Invalid refresh token" });
  }
};
// export const refreshAccessToken = (req, res) => {
//   const { refreshToken } = req.body;

//   if (!refreshToken) {
//     return res
//       .status(StatusCodes.BAD_REQUEST)
//       .json({ message: "Refresh token is required" });
//   }

//   try {
//     const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

//     const newAccessToken = jwt.sign(
//       { id: decoded.id, role: decoded.role },
//       process.env.JWT_SECRET,
//       { expiresIn: "15m" }
//     );

//     res.status(StatusCodes.OK).json({ accessToken: newAccessToken });
//   } catch (err) {
//     res.status(StatusCodes.UNAUTHORIZED).json({ message: "Invalid refresh token" });
//   }
// };






/////////////////////////////////////////////////////////////////////////////////////////////////////
// import jwt from "jsonwebtoken";
// import { StatusCodes } from "http-status-codes"

// export const isSuperAdmin = (req, res, next) => {
//   if (req.user && req.user.role === "superadmin") {
//     next(); // Allow access if the user is a super admin
//   } else {
//     res.status(403).json({ message: "Access denied. Only super admins are allowed." });
//   }
// };

// export const authenticateJWT = (req, res, next) => {
//   const authHeader = req.headers.authorization

//   if (!authHeader || !authHeader.startsWith("Bearer ")) {
//     console.log("No token provided or incorrect format")
//     return res.status(StatusCodes.UNAUTHORIZED).json({ message: "No token provided or incorrect format" })
//   }

//   const token = authHeader.split(" ")[1]

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET)
//     req.user = decoded
//     next()
//   } catch (err) {
//     console.log("Error verifying token:", err.message)
//     if (err.name === "TokenExpiredError") {
//       return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Token has expired" })
//     }
//     res.status(StatusCodes.UNAUTHORIZED).json({ message: "Token is invalid" })
//   }
// }
//////////////////////////////////////////////////////////////////////////////////////////////////////////////





