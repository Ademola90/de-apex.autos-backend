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
const allowLocalhost = (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Check if the origin is from localhost (any port)
    const isLocalhost = origin.startsWith("http://localhost:");

    // Allow your production frontend
    const isProductionFrontend = origin === 'https://de-apex-autos-backend.onrender.com/api';

    if (isLocalhost || isProductionFrontend) {
        return callback(null, true); // Allow the request
    } else {
        return callback(new Error("Not allowed by CORS")); // Block the request
    }
};

// CORS Configuration
const corsOptions = {
    origin: allowLocalhost, // Use the dynamic origin check
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
    methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
};
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Connect to MongoDB
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("Auth Service Connected to MongoDB");

        // Middleware
        app.use(cors(corsOptions));

        // Add COOP and COEP headers globally
        app.use((req, res, next) => {
            res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
            res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
            next();
        });

        // Trust the reverse proxy (e.g., Render)
        app.set('trust proxy', 1);
        app.use(express.json());

        // Serve static files from the 'uploads' directory
        app.use("/uploads", express.static(path.join(path.resolve(), "uploads")));

        // Routes
        app.use("/api/auth", authRoutes);
        app.use("/api/users", userRoutes);
        app.use('/api/super-admin', superAdminRoutes);
        app.use('/api/car', carManagementRoutes);
        app.use('/api/accessory', accessoryManagementRoutes);

        // Start Server
        const PORT = process.env.AUTH_SERVICE_PORT || 5000;
        app.listen(PORT, () => console.log(`Auth Service running on port ${PORT}`));
    })
    .catch((err) => {
        console.error("MongoDB Connection Error:", err.message); // Avoid printing full error stack
        process.exit(1);
    });
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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
// const allowLocalhost = (origin, callback) => {
//     // Allow requests with no origin (like mobile apps or curl requests)
//     if (!origin) return callback(null, true);

//     // Check if the origin is from localhost (any port)
//     const isLocalhost = origin.startsWith("http://localhost:");
//     if (isLocalhost) {
//         return callback(null, true); // Allow the request
//     } else {
//         return callback(new Error("Not allowed by CORS")); // Block the request
//     }
// };

// // CORS Configuration
// const corsOptions = {
//     origin: allowLocalhost, // Use the dynamic origin check
//     credentials: true, // Allow credentials (cookies, authorization headers, etc.)
//     methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
// };
// app.use(cors(corsOptions));

// // Handle preflight requests
// app.options('*', cors(corsOptions));

// // Connect to MongoDB
// mongoose
//     .connect(process.env.MONGO_URI)
//     .then(() => {
//         console.log("Auth Service Connected to MongoDB");

//         // Middleware
//         app.use(cors(corsOptions));

//         // Add COOP and COEP headers globally
//         app.use((req, res, next) => {
//             res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
//             res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
//             next();
//         });

//         // Trust the reverse proxy (e.g., Render)
//         app.set('trust proxy', 1);
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
//         console.error("MongoDB Connection Error:", err.message); // Avoid printing full error stack
//         process.exit(1);
//     });


//////////////////////////////////////////////////////////////////////////////////////////////////////////////
// // app.js
// import express from "express";
// import cors from "cors";
// import mongoose from "mongoose";
// import authRoutes from "./routes/authRoutes.js";
// import dotenv from "dotenv";
// import userRoutes from "./routes/userRoutes.js";
// import superAdminRoutes from './routes/superadmin.route.js';
// import carManagementRoutes from "./routes/carManagement.route.js";
// import accessoryManagementRoutes from "./routes/accessoryManagement.route.js";
// import path from "path"; // Import path module
// import googleRoutes from "./routes/googleRoutes.js";

// dotenv.config();

// const app = express();

// // Environment Variable Validation
// if (!process.env.MONGO_URI) {
//     console.error("MongoDB Connection Error: MONGO_URI is not defined in environment variables.");
//     process.exit(1); // Exit if MONGO_URI is missing
// }

// // CORS Configuration
// const corsOptions = {
//     origin: "http://localhost:3000", // Frontend URL
//     credentials: true, // Allow credentials (cookies, authorization headers, etc.)
//     methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
// };
// app.use(cors(corsOptions));

// // Connect to MongoDB
// mongoose
//     .connect(process.env.MONGO_URI)
//     .then(() => {
//         console.log("Auth Service Connected to MongoDB");

//         // Middleware
//         app.use(cors({ origin: "http://localhost:3000", credentials: true }));

//         // Add COOP and COEP headers globally
//         app.use((req, res, next) => {
//             res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
//             res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
//             next();
//         });

//         // Trust the reverse proxy (e.g., Render)
//         app.set('trust proxy', 1);
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
//         console.error("MongoDB Connection Error:", err.message); // Avoid printing full error stack
//         process.exit(1);
//     });





