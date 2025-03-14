import { StatusCodes } from "http-status-codes";
// import CarHire from "../models/carHire.js";
import cloudinary from "../scripts/cloudinaryConfig.js";
import { v4 as uuidv4 } from "uuid";
import CarHire from "../models/carHire.js";

// Helper function to upload images to Cloudinary
const uploadImageToCloudinary = async (file) => {
    const result = await cloudinary.uploader.upload(file.path, {
        folder: "car-hire",
        resource_type: "auto",
    });
    return {
        public_id: result.public_id,
        secure_url: result.secure_url,
    };
};

// Add a new car for hire
export const addCarHire = async (req, res) => {
    try {
        const {
            name,
            type,
            price,
            seats,
            transmission,
            fuelType,
            fuelEfficiency,
            location,
            description,
            features,
        } = req.body;

        // Validate required fields
        if (!name || !type || !price || !seats || !location || !description) {
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json({ message: "All required fields must be provided" });
        }

        // Parse features if it's a string
        let parsedFeatures = features;
        if (typeof features === "string") {
            try {
                parsedFeatures = JSON.parse(features);
            } catch (error) {
                parsedFeatures = features.split(",").map((feature) => feature.trim());
            }
        }

        // Upload images to Cloudinary
        const images = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const image = await uploadImageToCloudinary(file);
                images.push(image);
            }
        }

        if (images.length === 0) {
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json({ message: "At least one image is required" });
        }

        // Create new car hire entry
        const newCarHire = new CarHire({
            name,
            type,
            price: Number(price),
            seats: Number(seats),
            transmission: transmission || "Automatic",
            fuelType: fuelType || "Petrol",
            fuelEfficiency: fuelEfficiency || "",
            location,
            description,
            features: parsedFeatures || [],
            images,
            createdBy: req.user.id,
        });

        await newCarHire.save();

        res.status(StatusCodes.CREATED).json({
            message: "Car added successfully",
            car: newCarHire,
        });
    } catch (error) {
        console.error("Error adding car for hire:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Error adding car for hire",
            error: error.message,
        });
    }
};

// Get all cars for hire
export const getAllCars = async (req, res) => {
    try {
        const { location, type, status } = req.query;

        // Build filter object based on query parameters
        const filter = {};
        if (location) filter.location = location;
        if (type) filter.type = type;
        if (status) filter.status = status;

        const cars = await CarHire.find(filter).sort({ createdAt: -1 });

        res.status(StatusCodes.OK).json({
            count: cars.length,
            cars,
        });
    } catch (error) {
        console.error("Error fetching cars:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Error fetching cars",
            error: error.message,
        });
    }
};

// Get car by ID
export const getCarById = async (req, res) => {
    try {
        const car = await CarHire.findById(req.params.id);

        if (!car) {
            return res
                .status(StatusCodes.NOT_FOUND)
                .json({ message: "Car not found" });
        }

        res.status(StatusCodes.OK).json({ car });
    } catch (error) {
        console.error("Error fetching car:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Error fetching car",
            error: error.message,
        });
    }
};

// Update car by ID
export const updateCar = async (req, res) => {
    try {
        const {
            name,
            type,
            price,
            seats,
            transmission,
            fuelType,
            fuelEfficiency,
            location,
            description,
            features,
            status,
        } = req.body;

        const car = await CarHire.findById(req.params.id);

        if (!car) {
            return res
                .status(StatusCodes.NOT_FOUND)
                .json({ message: "Car not found" });
        }

        // Parse features if it's a string
        let parsedFeatures = features;
        if (typeof features === "string") {
            try {
                parsedFeatures = JSON.parse(features);
            } catch (error) {
                parsedFeatures = features.split(",").map((feature) => feature.trim());
            }
        }

        // Handle image uploads if any
        if (req.files && req.files.length > 0) {
            // Delete old images if replaceImages is true
            if (req.body.replaceImages === "true") {
                // Delete old images from Cloudinary
                for (const image of car.images) {
                    await cloudinary.uploader.destroy(image.public_id);
                }

                // Upload new images
                const newImages = [];
                for (const file of req.files) {
                    const image = await uploadImageToCloudinary(file);
                    newImages.push(image);
                }
                car.images = newImages;
            } else {
                // Add new images to existing ones
                for (const file of req.files) {
                    const image = await uploadImageToCloudinary(file);
                    car.images.push(image);
                }
            }
        }

        // Update car details
        car.name = name || car.name;
        car.type = type || car.type;
        car.price = price ? Number(price) : car.price;
        car.seats = seats ? Number(seats) : car.seats;
        car.transmission = transmission || car.transmission;
        car.fuelType = fuelType || car.fuelType;
        car.fuelEfficiency = fuelEfficiency !== undefined ? fuelEfficiency : car.fuelEfficiency;
        car.location = location || car.location;
        car.description = description || car.description;
        car.features = parsedFeatures || car.features;
        car.status = status || car.status;

        // If maintenance status is set, update lastMaintenance date
        if (status === "maintenance") {
            car.lastMaintenance = new Date();
            car.nextMaintenance = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days from now
        }

        await car.save();

        res.status(StatusCodes.OK).json({
            message: "Car updated successfully",
            car,
        });
    } catch (error) {
        console.error("Error updating car:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Error updating car",
            error: error.message,
        });
    }
};

// Delete car by ID
export const deleteCar = async (req, res) => {
    try {
        const car = await CarHire.findById(req.params.id);

        if (!car) {
            return res
                .status(StatusCodes.NOT_FOUND)
                .json({ message: "Car not found" });
        }

        // Delete images from Cloudinary
        for (const image of car.images) {
            await cloudinary.uploader.destroy(image.public_id);
        }

        await CarHire.findByIdAndDelete(req.params.id);

        res.status(StatusCodes.OK).json({
            message: "Car deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting car:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Error deleting car",
            error: error.message,
        });
    }
};

// Update car status
export const updateCarStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!status) {
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json({ message: "Status is required" });
        }

        const car = await CarHire.findById(req.params.id);

        if (!car) {
            return res
                .status(StatusCodes.NOT_FOUND)
                .json({ message: "Car not found" });
        }

        car.status = status;

        // If maintenance status is set, update lastMaintenance date
        if (status === "maintenance") {
            car.lastMaintenance = new Date();
            car.nextMaintenance = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days from now
        }

        await car.save();

        res.status(StatusCodes.OK).json({
            message: "Car status updated successfully",
            car,
        });
    } catch (error) {
        console.error("Error updating car status:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Error updating car status",
            error: error.message,
        });
    }
};

// Delete car image
export const deleteCarImage = async (req, res) => {
    try {
        const { imageId } = req.params;

        const car = await CarHire.findById(req.params.id);

        if (!car) {
            return res
                .status(StatusCodes.NOT_FOUND)
                .json({ message: "Car not found" });
        }

        // Find the image in the car's images array
        const imageIndex = car.images.findIndex(img => img._id.toString() === imageId);

        if (imageIndex === -1) {
            return res
                .status(StatusCodes.NOT_FOUND)
                .json({ message: "Image not found" });
        }

        // Delete the image from Cloudinary
        await cloudinary.uploader.destroy(car.images[imageIndex].public_id);

        // Remove the image from the car's images array
        car.images.splice(imageIndex, 1);

        await car.save();

        res.status(StatusCodes.OK).json({
            message: "Image deleted successfully",
            car,
        });
    } catch (error) {
        console.error("Error deleting car image:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Error deleting car image",
            error: error.message,
        });
    }
};