import { StatusCodes } from "http-status-codes";
import Accessory from "../models/accessory.js";

// Add a new accessory
export const addAccessory = async (req, res) => {
    try {
        const { name, description, price, category, make, stock } = req.body;

        if (!name || !description || !price || !category || !make || stock === undefined) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "All fields are required" });
        }

        // Validate files and create URLs
        const baseUrl = `${req.protocol}://${req.get("host")}`;
        const images = req.files?.map((file) => `${baseUrl}/uploads/${file.filename}`) || [];

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
// Get all accessories
export const getAccessories = async (req, res) => {
    try {
        const accessories = await Accessory.find();
        const baseUrl = `${req.protocol}://${req.get("host")}`;

        const accessoriesWithFullUrls = accessories.map((accessory) => ({
            ...accessory.toObject(),
            images: accessory.images.map((image) => (image.startsWith("http") ? image : `${baseUrl}${image}`)),
        }));

        res.status(StatusCodes.OK).json({
            success: true, // Add this line
            accessories: accessoriesWithFullUrls
        });
    } catch (error) {
        console.error("Error retrieving accessories:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false, // Add this line
            message: "Error retrieving accessories",
            error: error.message,
        });
    }
};

// Backend Controller 
export const getAccessoryById = async (req, res) => {
    try {
        const accessory = await Accessory.findById(req.params.id);
        if (!accessory) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Accessory not found" });
        }
        res.status(StatusCodes.OK).json({ accessory }); // Ensure this includes all fields
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Error retrieving accessory", error: error.message });
    }
};


// Update accessory by ID (with image handling)
export const updateAccessory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, category, make, stock, replaceImages, imageOrder } = req.body;

        const accessory = await Accessory.findById(id);
        if (!accessory) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Accessory not found" });
        }

        // Combine or replace images
        const baseUrl = `${req.protocol}://${req.get("host")}`;
        const newImages = req.files?.map((file) => `${baseUrl}/uploads/${file.filename}`) || [];

        if (replaceImages === 'true') {
            // Replace existing images
            accessory.images = newImages;
        } else {
            // Append new images
            accessory.images = [...accessory.images, ...newImages];
        }

        // Update the image order if provided
        if (imageOrder) {
            const order = JSON.parse(imageOrder);
            accessory.images = order.map(index => accessory.images[index]);
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

// Delete accessory by ID
export const deleteAccessory = async (req, res) => {
    try {
        const accessory = await Accessory.findByIdAndDelete(req.params.id);
        if (!accessory) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Accessory not found" });
        }
        res.status(StatusCodes.OK).json({ message: "Accessory deleted successfully" });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Error deleting accessory", error: error.message });
    }
};