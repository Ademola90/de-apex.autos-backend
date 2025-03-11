import { StatusCodes } from "http-status-codes";
import Accessory from "../models/accessory.js";
import cloudinary from "../scripts/cloudinaryConfig.js";

// Helper function to upload images to Cloudinary
const uploadImageToCloudinary = async (file) => {
    const result = await cloudinary.uploader.upload(file.path, {
        folder: "uploads",
        resource_type: "auto",
    });
    return {
        public_id: result.public_id,
        secure_url: result.secure_url,
    };
};

// Add a new accessory
export const addAccessory = async (req, res) => {
    try {
        const { name, description, price, category, make, stock } = req.body;

        if (!name || !description || !price || !category || !make || stock === undefined) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "All fields are required" });
        }

        const images = [];
        if (req.files) {
            for (const file of req.files) {
                const image = await uploadImageToCloudinary(file);
                images.push(image);
            }
        }

        if (images.length === 0) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "At least one image is required" });
        }

        const newAccessory = new Accessory({
            name,
            description,
            price,
            category,
            make,
            stock,
            images,
            createdBy: req.user.userId,
        });

        await newAccessory.save();

        res.status(StatusCodes.CREATED).json({
            message: "Accessory added successfully",
            accessory: newAccessory,
        });
    } catch (error) {
        console.error("Error adding accessory:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Error adding accessory",
            error: error.message,
        });
    }
};

// Delete accessory by ID
export const deleteAccessory = async (req, res) => {
    try {
        const accessory = await Accessory.findById(req.params.id);
        if (!accessory) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Accessory not found" });
        }

        // Delete images from Cloudinary
        const imageDeletions = accessory.images.map((image) =>
            cloudinary.uploader.destroy(image.public_id)
        );
        await Promise.all(imageDeletions);

        // Delete the accessory from the database
        await Accessory.findByIdAndDelete(req.params.id);

        res.status(StatusCodes.OK).json({ message: "Accessory deleted successfully" });
    } catch (error) {
        console.error("Error deleting accessory:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Error deleting accessory",
            error: error.message,
        });
    }
};






// Get all accessories
export const getAccessories = async (req, res) => {
    try {
        const accessories = await Accessory.find();
        res.status(StatusCodes.OK).json({ accessories });
    } catch (error) {
        console.error("Error retrieving accessories:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Error retrieving accessories",
            error: error.message,
        });
    }
};

// export const addAccessory = async (req, res) => {
//     try {
//         const { name, description, price, category, make, stock } = req.body;

//         if (!name || !description || !price || !category || !make || stock === undefined) {
//             return res.status(StatusCodes.BAD_REQUEST).json({ message: "All fields are required" });
//         }

//         // Validate files and create URLs
//         const baseUrl = `${req.protocol}://${req.get("host")}`;
//         const images = req.files?.map((file) => `${baseUrl}/uploads/${file.filename}`) || [];

//         if (images.length === 0) {
//             return res.status(StatusCodes.BAD_REQUEST).json({ message: "At least one image is required" });
//         }

//         const newAccessory = new Accessory({
//             name,
//             description,
//             price,
//             category,
//             make,
//             stock,
//             images,
//             createdBy: req.user.userId,
//         });

//         await newAccessory.save();

//         res.status(StatusCodes.CREATED).json({
//             message: "Accessory added successfully",
//             accessory: newAccessory,
//         });
//     } catch (error) {
//         console.error("Error adding accessory:", error);
//         res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
//             message: "Error adding accessory",
//             error: error.message,
//         });
//     }
// };


// Get accessory by ID
export const getAccessoryById = async (req, res) => {
    try {
        const accessory = await Accessory.findById(req.params.id);
        if (!accessory) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Accessory not found" });
        }
        res.status(StatusCodes.OK).json({ accessory });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Error retrieving accessory",
            error: error.message,
        });
    }
};


// Update accessory by ID
export const updateAccessory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, category, make, stock, replaceImages, imageOrder } = req.body;

        const accessory = await Accessory.findById(id);
        if (!accessory) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Accessory not found" });
        }

        // Handle image updates
        if (req.files) {
            const newImages = [];
            for (const file of req.files) {
                const image = await uploadImageToCloudinary(file);
                newImages.push(image);
            }

            if (replaceImages === "true") {
                // Delete old images from Cloudinary
                const imageDeletions = accessory.images.map((image) =>
                    cloudinary.uploader.destroy(image.public_id)
                );
                await Promise.all(imageDeletions);

                // Replace with new images
                accessory.images = newImages;
            } else {
                // Append new images
                accessory.images = [...accessory.images, ...newImages];
            }
        }

        // Update the accessory details
        accessory.name = name || accessory.name;
        accessory.description = description || accessory.description;
        accessory.price = price || accessory.price;
        accessory.category = category || accessory.category;
        accessory.make = make || accessory.make;
        accessory.stock = stock || accessory.stock;

        // Update status based on stock
        if (accessory.stock > 10) {
            accessory.status = "In Stock";
        } else if (accessory.stock > 0) {
            accessory.status = "Low Stock";
        } else {
            accessory.status = "Out of Stock";
        }

        const updatedAccessory = await accessory.save();

        res.status(StatusCodes.OK).json({
            message: "Accessory updated successfully",
            accessory: updatedAccessory,
        });
    } catch (error) {
        console.error("Error updating accessory:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Error updating accessory",
            error: error.message,
        });
    }
};

// Update accessory inventory
export const updateAccessoryInventory = async (req, res) => {
    try {
        const { id } = req.params;
        const { stock, sold } = req.body;

        const accessory = await Accessory.findById(id);
        if (!accessory) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Accessory not found" });
        }

        // Update stock and sold quantities
        if (stock !== undefined) accessory.stock = stock;
        if (sold !== undefined) accessory.sold = sold;

        // Update status based on stock
        if (accessory.stock > 10) {
            accessory.status = "In Stock";
        } else if (accessory.stock > 0) {
            accessory.status = "Low Stock";
        } else {
            accessory.status = "Out of Stock";
        }

        const updatedAccessory = await accessory.save();

        res.status(StatusCodes.OK).json({
            message: "Accessory inventory updated successfully",
            accessory: updatedAccessory,
        });
    } catch (error) {
        console.error("Error updating accessory inventory:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Error updating accessory inventory",
            error: error.message,
        });
    }
};

