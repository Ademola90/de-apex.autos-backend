// app.js
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes.js";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes.js"
dotenv.config();

const app = express();

// Environment Variable Validation
if (!process.env.MONGO_URI) {
    console.error("MongoDB Connection Error: MONGO_URI is not defined in environment variables.");
    process.exit(1); // Exit if MONGO_URI is missing
}

// Connect to MongoDB
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("Auth Service Connected to MongoDB");

        // Middleware
        app.use(cors());

        // Trust the reverse proxy (e.g., Render)
        app.set('trust proxy', 1);

        // Use `express.json()` only for requests that expect a JSON body
        app.use((req, res, next) => {
            if (["POST", "PUT", "PATCH"].includes(req.method)) {
                express.json()(req, res, next);
            } else {
                next();
            }
        });

        // Routes
        app.use("/api/auth", authRoutes);
        app.use("/api/users", userRoutes);

        // Start Server
        const PORT = process.env.AUTH_SERVICE_PORT || 5000;
        app.listen(PORT, () => console.log(`Auth Service running on port ${PORT}`));
    })
    .catch((err) => {
        console.error("MongoDB Connection Error:", err.message); // Avoid printing full error stack
        process.exit(1);
    });






// import express from "express";
// import cors from "cors";
// import mongoose from "mongoose";
// import authRoutes from "./routes/authRoutes.js";
// import dotenv from "dotenv";
// dotenv.config();

// const app = express();

// // Environment Variable Validation
// if (!process.env.MONGO_URI) {
//     console.error("MongoDB Connection Error: MONGO_URI is not defined in environment variables.");
//     process.exit(1); // Exit if MONGO_URI is missing
// }

// // Connect to MongoDB
// mongoose
//     .connect(process.env.MONGO_URI)
//     .then(() => {
//         console.log("Auth Service Connected to MongoDB");

//         // Middleware
//         app.use(cors());
//         app.set('trust proxy', 1);

//         // Use `express.json()` only for requests that expect a JSON body
//         app.use((req, res, next) => {
//             if (["POST", "PUT", "PATCH"].includes(req.method)) {
//                 express.json()(req, res, next);
//             } else {
//                 next();
//             }
//         });

//         // Routes
//         app.use("/api/auth", authRoutes);

//         // Start Server
//         const PORT = process.env.AUTH_SERVICE_PORT || 5000;
//         app.listen(PORT, () => console.log(`Auth Service running on port ${PORT}`));
//     })
//     .catch((err) => {
//         console.error("MongoDB Connection Error:", err.message); // Avoid printing full error stack
//         process.exit(1);
//     });




// import express from "express";
// import cors from "cors";
// import mongoose from "mongoose";
// import authRoutes from "./routes/authRoutes.js";
// import dotenv from "dotenv";
// dotenv.config();


// const app = express();

// // Environment Variable Validation
// if (!process.env.MONGO_URI) {
//     console.error("MongoDB Connection Error: MONGO_URI is not defined in environment variables.");
//     process.exit(1); // Exit if MONGO_URI is missing
// }

// // Connect to MongoDB
// mongoose
//     .connect(process.env.MONGO_URI)
//     .then(() => {
//         console.log("Auth Service Connected to MongoDB");

//         // Middleware
//         app.use(cors());
//         app.use(express.json());

//         // Routes
//         app.use("/api/auth", authRoutes);

//         // Start Server
//         const PORT = process.env.AUTH_SERVICE_PORT || 5000;
//         app.listen(PORT, () => console.log(`Auth Service running on port ${PORT}`));
//     })
//     .catch((err) => {
//         console.error("MongoDB Connection Error:", err.message); // Avoid printing full error stack
//         process.exit(1);
//     });
