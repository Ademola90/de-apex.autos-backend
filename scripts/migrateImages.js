import mongoose from "mongoose";
import dotenv from "dotenv";
import Car from "../models/Car.js"; // Add .js extension
import Accessory from "../models/accessory.js"; // Add .js extension and ensure correct filename

// Load environment variables
dotenv.config();

const migrateImages = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log("Connected to MongoDB");

        // Update Car images
        const cars = await Car.find({});
        for (const car of cars) {
            car.images = car.images.map((image) => {
                // Convert absolute URLs to relative paths
                if (image.startsWith("http")) {
                    return image.replace(/^https?:\/\/[^/]+/, "");
                }
                return image; // Keep relative paths as-is
            });
            await car.save();
        }

        // Update Accessory images
        const accessories = await Accessory.find({});
        for (const accessory of accessories) {
            accessory.images = accessory.images.map((image) => {
                // Convert absolute URLs to relative paths
                if (image.startsWith("http")) {
                    return image.replace(/^https?:\/\/[^/]+/, "");
                }
                return image; // Keep relative paths as-is
            });
            await accessory.save();
        }

        console.log("Migration completed successfully!");
    } catch (error) {
        console.error("Error during migration:", error);
    } finally {
        mongoose.disconnect();
    }
};

// Run the migration
migrateImages();