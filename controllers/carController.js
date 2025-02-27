// controllers/carController.js
import { StatusCodes } from "http-status-codes"
import Car from "../models/Car.js"

// Add a new car
export const addCar = async (req, res) => {
    try {
        const { make, model, year, type, price, description } = req.body;

        if (!make || !model || !year || !type || !price || !description) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "All fields are required" });
        }

        // Validate files and create URLs
        const baseUrl = `${req.protocol}://${req.get("host")}`;
        const images = req.files?.map((file) => `${baseUrl}/uploads/${file.filename}`) || [];

        if (images.length === 0) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "At least one image is required" });
        }

        const newCar = new Car({
            make,
            model,
            year,
            type,
            price,
            description,
            images,
            createdBy: req.user.userId,
        });

        await newCar.save();

        res.status(StatusCodes.CREATED).json({
            message: "Car added successfully",
            car: newCar,
        });
    } catch (error) {
        console.error("Error adding car:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Error adding car",
            error: error.message,
        });
    }
};

// Get all cars
export const getCars = async (req, res) => {
    try {
        const cars = await Car.find()
        const baseUrl = `${req.protocol}://${req.get("host")}`

        const carsWithFullUrls = cars.map((car) => ({
            ...car.toObject(),
            images: car.images.map((image) => (image.startsWith("http") ? image : `${baseUrl}${image}`)),
        }))

        res.status(StatusCodes.OK).json({ cars: carsWithFullUrls })
    } catch (error) {
        console.error("Error retrieving cars:", error)
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Error retrieving cars",
            error: error.message,
        })
    }
}

// Get car by ID
export const getCarById = async (req, res) => {
    try {
        const car = await Car.findById(req.params.id)
        if (!car) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Car not found" })
        }
        res.status(StatusCodes.OK).json({ car })
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Error retrieving car", error: error.message })
    }
}


// // Update car by ID

export const updateCar = async (req, res) => {
    try {
        const { id } = req.params;
        const { make, model, year, type, price, description, replaceImages, imageOrder } = req.body;

        const car = await Car.findById(id);
        if (!car) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Car not found" });
        }

        // Combine or replace images
        const baseUrl = `${req.protocol}://${req.get("host")}`;
        const newImages = req.files?.map((file) => `${baseUrl}/uploads/${file.filename}`) || [];

        if (replaceImages === 'true') {
            // Replace existing images
            car.images = newImages;
        } else {
            // Append new images
            car.images = [...car.images, ...newImages];
        }

        // Update the image order if provided
        if (imageOrder) {
            const order = JSON.parse(imageOrder);
            car.images = order.map(index => car.images[index]);
        }

        // Update the car details
        car.make = make || car.make;
        car.model = model || car.model;
        car.year = year || car.year;
        car.type = type || car.type;
        car.price = price || car.price;
        car.description = description || car.description;

        const updatedCar = await car.save();

        res.status(StatusCodes.OK).json({
            message: "Car updated successfully",
            car: updatedCar,
        });
    } catch (error) {
        console.error("Error updating car:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Error updating car",
            error: error.message,
        });
    }
};



export const getCategorizedCars = async (req, res) => {
    try {
        const cars = await Car.find();

        // Group cars by Make
        const carsByMake = cars.reduce((acc, car) => {
            if (!acc[car.make]) {
                acc[car.make] = [];
            }
            acc[car.make].push(car);
            return acc;
        }, {});

        // Group cars by Type
        const carsByType = cars.reduce((acc, car) => {
            if (!acc[car.type]) {
                acc[car.type] = [];
            }
            acc[car.type].push(car);
            return acc;
        }, {});

        res.status(StatusCodes.OK).json({
            success: true,
            carsByMake,
            carsByType,
        });
    } catch (error) {
        console.error("Error fetching categorized cars:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Error fetching categorized cars",
            error: error.message,
        });
    }
};



// export const updateCar = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const { make, model, year, type, price, description } = req.body;

//         const car = await Car.findById(id);
//         if (!car) {
//             return res.status(StatusCodes.NOT_FOUND).json({ message: "Car not found" });
//         }

//         // Combine new uploads with existing images
//         const baseUrl = `${req.protocol}://${req.get("host")}`;
//         const newImages = req.files?.map((file) => `${baseUrl}/uploads/${file.filename}`) || [];
//         const updatedImages = [...car.images, ...newImages];

//         // Update the car
//         car.make = make || car.make;
//         car.model = model || car.model;
//         car.year = year || car.year;
//         car.type = type || car.type;
//         car.price = price || car.price;
//         car.description = description || car.description;
//         car.images = updatedImages;

//         const updatedCar = await car.save();

//         res.status(StatusCodes.OK).json({
//             message: "Car updated successfully",
//             car: updatedCar,
//         });
//     } catch (error) {
//         console.error("Error updating car:", error);
//         res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
//             message: "Error updating car",
//             error: error.message,
//         });
//     }
// };

// Delete car by ID
export const deleteCar = async (req, res) => {
    try {
        const { id } = req.params
        const deletedCar = await Car.findByIdAndDelete(id)
        if (!deletedCar) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Car not found" })
        }
        res.status(StatusCodes.OK).json({ message: "Car deleted successfully" })
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Error deleting car", error: error.message })
    }
}





// import Car from "../models/Car.js";
// import { StatusCodes } from "http-status-codes";

// // Add a new car
// export const addCar = async (req, res) => {
//     try {
//         const { make, model, year, type, price, description } = req.body;

//         if (!make || !model || !year || !type || !price || !description) {
//             return res.status(StatusCodes.BAD_REQUEST).json({ message: "All fields are required" });
//         }

//         // Map files to store only the relative path
//         const images = req.files?.map((file) => `/uploads/${file.filename}`) || [];

//         if (images.length === 0) {
//             return res.status(StatusCodes.BAD_REQUEST).json({ message: "At least one image is required" });
//         }

//         const newCar = new Car({
//             make,
//             model,
//             year,
//             type,
//             price,
//             description,
//             images,
//             createdBy: req.user.userId,
//         });

//         await newCar.save();

//         // Prepend base URL when sending response
//         const carWithFullPaths = {
//             ...newCar._doc,
//             images: images.map((image) => `${req.protocol}://${req.get("host")}${image}`),
//         };

//         res.status(StatusCodes.CREATED).json({ message: "Car added successfully", car: carWithFullPaths });
//     } catch (error) {
//         res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Error adding car", error: error.message });
//     }
// };



// // Get all cars
// export const getCars = async (req, res) => {
//     try {
//         const cars = await Car.find(); // Correct model name
//         res.status(StatusCodes.OK).json({ cars });
//     } catch (error) {
//         console.error("Error retrieving cars:", error);
//         res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Error retrieving cars", error: error.message });
//     }
// };


// // Update a car
// export const updateCar = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const { make, model, year, type, price, description } = req.body;
//         const car = await Car.findById(id);

//         if (!car) {
//             return res.status(StatusCodes.NOT_FOUND).json({ message: "Car not found" });
//         }

//         if (req.user.userId !== car.createdBy.toString()) {
//             return res.status(StatusCodes.FORBIDDEN).json({ message: "Unauthorized" });
//         }

//         car.make = make || car.make;
//         car.model = model || car.model;
//         car.year = year || car.year;
//         car.type = type || car.type;
//         car.price = price || car.price;
//         car.description = description || car.description;

//         if (req.files && req.files.length > 0) {
//             // Update images with relative paths
//             car.images = req.files.map((file) => `/uploads/${file.filename}`);
//         }

//         await car.save();

//         // Prepend base URL when sending response
//         const carWithFullPaths = {
//             ...car._doc,
//             images: car.images.map((image) => `${req.protocol}://${req.get("host")}${image}`),
//         };

//         res.status(StatusCodes.OK).json({ message: "Car updated successfully", car: carWithFullPaths });
//     } catch (error) {
//         res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Error updating car", error: error.message });
//     }
// };



// // Delete a car
// export const deleteCar = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const car = await Car.findById(id);

//         if (!car) {
//             return res.status(StatusCodes.NOT_FOUND).json({ message: "Car not found" });
//         }

//         if (req.user.role !== "superadmin" && req.user.userId !== car.createdBy.toString()) {
//             return res.status(StatusCodes.FORBIDDEN).json({ message: "Unauthorized" });
//         }

//         await car.remove();
//         res.status(StatusCodes.OK).json({ message: "Car deleted successfully" });
//     } catch (error) {
//         res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Error deleting car", error: error.message });
//     }
// };
