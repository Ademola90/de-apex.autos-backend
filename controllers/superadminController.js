//conttollers/superadminControllers

import User from "../models/User.js"
import bcrypt from "bcrypt"
import { StatusCodes } from "http-status-codes"

export const createSuperadmin = async (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    try {
        // Check if a super admin already exists
        const existingSuperAdmin = await User.findOne({ role: "superadmin" });
        if (existingSuperAdmin) {
            return res.status(StatusCodes.CONFLICT).json({ message: "Super admin already exists!" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10); // Ensure this is working correctly

        // Create new super admin
        const newSuperAdmin = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword, // Ensure the hashed password is saved
            role: "superadmin",
            emailVerified: true,
        });

        await newSuperAdmin.save();

        res.status(StatusCodes.CREATED).json({ message: "Super admin created successfully!" });
    } catch (error) {
        console.error("Error creating super admin:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Error creating super admin", error: error.message });
    }
};


