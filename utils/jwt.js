// utils/jwt.js
// import jwt from "jsonwebtoken";

// export const generateToken = (user) => {
//     return jwt.sign(
//         {
//             id: user._id,
//             role: user.role,
//         },
//         process.env.JWT_SECRET,
//         { expiresIn: '1d' }
//     );
// };

// export const verifyToken = (token) => {
//     try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         return { status: true, data: decoded };
//     } catch (error) {
//         return { status: false, message: "Invalid or expired token" };
//     }
// };


// //auth-service/utils/jwt.js
// import jwt from "jsonwebtoken";

// export const generateToken = (user) => {
//     return jwt.sign(
//         {
//             id: user._id,
//             role: user.role,
//         },
//         process.env.JWT_SECRET,
//         { expiresIn: '1d' }
//     );
// };

// export const verifyToken = (token, email, purpose) => {
//     try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         if (decoded.email !== email || decoded.purpose !== purpose) {
//             return { status: false, message: "Invalid OTP or email mismatch" };
//         }
//         return { status: true, data: decoded };
//     } catch (error) {
//         return { status: false, message: "Invalid or expired OTP" };
//     }
// };


// import jwt from "jsonwebtoken";
// import { sendResponse, sendError } from "../utils/response.js";
// import User from "../models/user.js";

// export const jwtDecode = async (req, res, next) => {
//   if (!req.headers.authorization) {
//     return sendError(res, 401, "Authorization header is required");
//   }

//   const [type, token] = req.headers.authorization.split(" ");
//   // console.log("Type:", type, "Token:", token);

//   if (type !== "Bearer" || !token) {
//     return sendError(res, 400, "Invalid token type");
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     const user = await User.findById(decoded.id);

//     if (!user) {
//       return sendError(res, 404, "User not found");
//     }
//     req.user = decoded;

//     next();
//   } catch (error) {
//     sendError(res, 401, "Invalid token");
//   }
// };
