//controller/adminController
import jwt from "jsonwebtoken";
import User from "../models/User.js"
import bcrypt from "bcrypt"
import { StatusCodes } from "http-status-codes"

export const createAdmin = async (req, res) => {
    const { firstName, lastName, email, password } = req.body

    try {
        // Check if the requester is a super admin
        if (req.user.role !== "superadmin") {
            return res.status(StatusCodes.FORBIDDEN).json({ message: "Only super admin can create admin accounts" })
        }

        // Check if the email is already in use
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(StatusCodes.CONFLICT).json({ message: "Email is already in use" })
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Create the new admin user
        const newAdmin = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role: "admin",
            emailVerified: true, // Admins don't need email verification
            createdBy: req.user.userId, // Add the createdBy field
        })

        await newAdmin.save()

        res.status(StatusCodes.CREATED).json({ message: "Admin account created successfully" })
    } catch (error) {
        console.error("Error creating admin account:", error)
        res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ message: "An error occurred while creating the admin account" })
    }
}




