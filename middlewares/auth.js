// import jwt from "jsonwebtoken";

// export const authenticateJWT = (req, res, next) => {
//   // Extract token from the 'Authorization' header
//   const authHeader = req.headers.authorization;

//   if (!authHeader || !authHeader.startsWith("Bearer ")) {
//     return res.status(401).json({ message: "Access token is required" });
//   }

//   const token = authHeader.split(" ")[1]; // Extract the token part

//   try {
//     // Verify the token
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     // Optionally attach user ID to the request object if present in the token payload
//     req.userId = decoded.id || null; // Attach `id` if exists
//     req.user = decoded; // Attach full decoded token payload

//     next(); // Proceed to the next middleware or route handler
//   } catch (error) {
//     return res.status(403).json({ message: "Invalid or expired token" });
//   }
// };
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




// export const authenticateJWT = (req, res, next) => {
//   const authHeader = req.headers.authorization;
//   if (!authHeader || !authHeader.startsWith("Bearer ")) {
//     return res.status(401).json({ message: "Authorization token missing or invalid" });
//   }

//   const token = authHeader.split(" ")[1];
//   jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
//     if (err) {
//       return res.status(403).json({ message: "Token is invalid" });
//     }
//     req.user = user;
//     next();
//   });
// };


