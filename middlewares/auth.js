//middlewares/auth.js
import jwt from "jsonwebtoken";

// Generate a JWT with custom claims and expiration
export const generateToken = (payload, expiresIn = "1h") => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

// Verify a token for specific claims (e.g., email, purpose)
export const verifyToken = (token, email, purpose) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Validate additional claims
    if (decoded.email !== email || decoded.purpose !== purpose) {
      return { status: false, message: "Invalid OTP or email mismatch" };
    }

    return { status: true, data: decoded };
  } catch (error) {
    return { status: false, message: "Invalid or expired OTP" };
  }
};

// Authenticate JWT for general requests
export const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("No token provided or incorrect format");
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1]; // Extract token from Bearer
  console.log("Token Received:", token);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token
    console.log("Decoded Token:", decoded);
    req.user = decoded; // Attach decoded payload to the request
    next();
  } catch (err) {
    console.log("Error verifying token:", err.message); // Log error
    res.status(401).json({ message: "Token is invalid" });
  }
};

// OTP-related functions
export const generateOtpToken = (email) => {
  const payload = { email, purpose: "OTP" };
  return generateToken(payload, "5m"); // Token expires in 5 minutes
};

export const verifyOtpToken = (token, email) => {
  return verifyToken(token, email, "OTP");
};




// import jwt from "jsonwebtoken";

// // Generate a JWT with custom claims and expiration
// export const generateToken = (payload, expiresIn = "1h") => {
//   return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
// };

// // Verify a token for specific claims (e.g., email, purpose)
// export const verifyToken = (token, email, purpose) => {
//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     // Validate additional claims
//     if (decoded.email !== email || decoded.purpose !== purpose) {
//       return { status: false, message: "Invalid OTP or email mismatch" };
//     }

//     return { status: true, data: decoded };
//   } catch (error) {
//     return { status: false, message: "Invalid or expired OTP" };
//   }
// };

// export const authenticateJWT = (req, res, next) => {
//   const authHeader = req.headers.authorization;

//   if (!authHeader || !authHeader.startsWith("Bearer ")) {
//     console.log("No token provided or incorrect format");
//     return res.status(401).json({ message: "No token provided" });
//   }

//   const token = authHeader.split(" ")[1]; // Extract token from Bearer
//   console.log("Token Received:", token);

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token
//     console.log("Decoded Token:", decoded);
//     req.user = decoded; // Attach decoded payload to the request
//     next();
//   } catch (err) {
//     console.log("Error verifying token:", err.message); // Log error
//     res.status(401).json({ message: "Token is invalid" });
//   }
// };




