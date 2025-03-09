import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes.js";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes.js";
import superAdminRoutes from './routes/superadmin.route.js';
import carManagementRoutes from "./routes/carManagement.route.js";
import accessoryManagementRoutes from "./routes/accessoryManagement.route.js";
import path from "path";
import googleRoutes from "./routes/googleRoutes.js";

dotenv.config();

const app = express();

// Environment Variable Validation
if (!process.env.MONGO_URI) {
    console.error("MongoDB Connection Error: MONGO_URI is not defined in environment variables.");
    process.exit(1); // Exit if MONGO_URI is missing
}

// Dynamic CORS Origin Check
const allowAnyOrigin = (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Define a list of trusted domains or patterns (optional)
    const trustedDomains = [
        /\.vercel\.app$/, // Allow any Vercel deployment
        /\.render\.com$/, // Allow any Render deployment
        /localhost:\d+$/, // Allow localhost with any port
    ];

    // Check if the origin matches any trusted domain pattern
    const isTrusted = trustedDomains.some((pattern) => pattern.test(origin));

    if (isTrusted) {
        return callback(null, true); // Allow the request
    } else {
        return callback(new Error("Not allowed by CORS")); // Block the request
    }
};

// CORS Configuration
const corsOptions = {
    origin: allowAnyOrigin, // Use the dynamic origin check
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Include OPTIONS for preflight requests
};
app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options('*', cors(corsOptions)); // Allow preflight requests for all routes

// Middleware
app.use(express.json());

// Serve static files from the 'uploads' directory
const __dirname = path.resolve();
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use('/api/super-admin', superAdminRoutes);
app.use('/api/car', carManagementRoutes);
app.use('/api/accessory', accessoryManagementRoutes);

// Connect to MongoDB
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("Auth Service Connected to MongoDB");

        // Start Server
        const PORT = process.env.AUTH_SERVICE_PORT || 5000;
        app.listen(PORT, () => console.log(`Auth Service running on port ${PORT}`));
    })
    .catch((err) => {
        console.error("MongoDB Connection Error:", err.message);
        process.exit(1);
    });


// import express from "express";
// import cors from "cors";
// import mongoose from "mongoose";
// import authRoutes from "./routes/authRoutes.js";
// import dotenv from "dotenv";
// import userRoutes from "./routes/userRoutes.js";
// import superAdminRoutes from './routes/superadmin.route.js';
// import carManagementRoutes from "./routes/carManagement.route.js";
// import accessoryManagementRoutes from "./routes/accessoryManagement.route.js";
// import path from "path";
// import googleRoutes from "./routes/googleRoutes.js";

// dotenv.config();

// const app = express();

// // Environment Variable Validation
// if (!process.env.MONGO_URI) {
//     console.error("MongoDB Connection Error: MONGO_URI is not defined in environment variables.");
//     process.exit(1); // Exit if MONGO_URI is missing
// }

// // Dynamic CORS Origin Check
// const allowAnyOrigin = (origin, callback) => {
//     // Allow requests with no origin (like mobile apps or curl requests)
//     if (!origin) return callback(null, true);

//     // Define a list of trusted domains or patterns (optional)
//     const trustedDomains = [
//         /\.vercel\.app$/, // Allow any Vercel deployment
//         /\.render\.com$/, // Allow any Render deployment
//         /localhost:\d+$/, // Allow localhost with any port
//     ];

//     // Check if the origin matches any trusted domain pattern
//     const isTrusted = trustedDomains.some((pattern) => pattern.test(origin));

//     if (isTrusted) {
//         return callback(null, true); // Allow the request
//     } else {
//         return callback(new Error("Not allowed by CORS")); // Block the request
//     }
// };

// // CORS Configuration
// const corsOptions = {
//     origin: allowAnyOrigin, // Use the dynamic origin check
//     credentials: true, // Allow credentials (cookies, authorization headers, etc.)
//     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Include OPTIONS for preflight requests
// };
// app.use(cors(corsOptions));

// // Handle preflight requests explicitly
// app.options('*', cors(corsOptions)); // Allow preflight requests for all routes

// // Connect to MongoDB
// mongoose
//     .connect(process.env.MONGO_URI)
//     .then(() => {
//         console.log("Auth Service Connected to MongoDB");

//         // Middleware
//         app.use(express.json());

//         // Serve static files from the 'uploads' directory
//         app.use("/uploads", express.static(path.join(path.resolve(), "uploads")));

//         // Routes
//         app.use("/api/auth", authRoutes);
//         app.use("/api/users", userRoutes);
//         app.use('/api/super-admin', superAdminRoutes);
//         app.use('/api/car', carManagementRoutes);
//         app.use('/api/accessory', accessoryManagementRoutes);

//         // Start Server
//         const PORT = process.env.AUTH_SERVICE_PORT || 5000;
//         app.listen(PORT, () => console.log(`Auth Service running on port ${PORT}`));
//     })
//     .catch((err) => {
//         console.error("MongoDB Connection Error:", err.message);
//         process.exit(1);
//     });





