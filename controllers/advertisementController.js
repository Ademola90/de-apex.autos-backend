import { StatusCodes } from "http-status-codes"
import Advertisement from "../models/Advertisement.js"
import cloudinary from "../scripts/cloudinaryConfig.js"

// Helper function to upload images to Cloudinary
const uploadImageToCloudinary = async (file) => {
    const result = await cloudinary.uploader.upload(file.path, {
        folder: "advertisements",
        resource_type: "auto",
    })
    return {
        public_id: result.public_id,
        secure_url: result.secure_url,
    }
}

// Create a new advertisement
export const createAdvertisement = async (req, res) => {
    try {
        const { title, description, type, category, targetPages, link, isActive, priority, startDate, endDate } = req.body

        if (!title || !description || !link) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Title, description, and link are required",
            })
        }

        if (!req.file) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Advertisement image is required",
            })
        }

        const image = await uploadImageToCloudinary(req.file)

        const advertisement = new Advertisement({
            title,
            description,
            type: type || "banner",
            category: category || "general",
            targetPages: targetPages ? JSON.parse(targetPages) : ["home"],
            image,
            link,
            isActive: isActive !== undefined ? isActive : true,
            priority: priority || 0,
            startDate: startDate || new Date(),
            endDate: endDate || null,
            createdBy: req.user.userId,
        })

        await advertisement.save()

        res.status(StatusCodes.CREATED).json({
            success: true,
            message: "Advertisement created successfully",
            advertisement,
        })
    } catch (error) {
        console.error("Error creating advertisement:", error)
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Error creating advertisement",
            error: error.message,
        })
    }
}

// Get all advertisements
export const getAllAdvertisements = async (req, res) => {
    try {
        const advertisements = await Advertisement.find().sort({ createdAt: -1 })

        res.status(StatusCodes.OK).json({
            success: true,
            count: advertisements.length,
            advertisements,
        })
    } catch (error) {
        console.error("Error fetching advertisements:", error)
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Error fetching advertisements",
            error: error.message,
        })
    }
}

// Get advertisement by ID
export const getAdvertisementById = async (req, res) => {
    try {
        const advertisement = await Advertisement.findById(req.params.id)

        if (!advertisement) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: "Advertisement not found",
            })
        }

        res.status(StatusCodes.OK).json({
            success: true,
            advertisement,
        })
    } catch (error) {
        console.error("Error fetching advertisement:", error)
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Error fetching advertisement",
            error: error.message,
        })
    }
}

// Update advertisement
export const updateAdvertisement = async (req, res) => {
    try {
        const { title, description, type, category, targetPages, link, isActive, priority, startDate, endDate } = req.body

        const advertisement = await Advertisement.findById(req.params.id)

        if (!advertisement) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: "Advertisement not found",
            })
        }

        // Update fields if provided
        if (title) advertisement.title = title
        if (description) advertisement.description = description
        if (type) advertisement.type = type
        if (category) advertisement.category = category
        if (targetPages) advertisement.targetPages = JSON.parse(targetPages)
        if (link) advertisement.link = link
        if (isActive !== undefined) advertisement.isActive = isActive
        if (priority !== undefined) advertisement.priority = priority
        if (startDate) advertisement.startDate = startDate
        if (endDate) advertisement.endDate = endDate

        // Update image if provided
        if (req.file) {
            // Delete old image from Cloudinary
            if (advertisement.image && advertisement.image.public_id) {
                await cloudinary.uploader.destroy(advertisement.image.public_id)
            }

            // Upload new image
            const image = await uploadImageToCloudinary(req.file)
            advertisement.image = image
        }

        await advertisement.save()

        res.status(StatusCodes.OK).json({
            success: true,
            message: "Advertisement updated successfully",
            advertisement,
        })
    } catch (error) {
        console.error("Error updating advertisement:", error)
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Error updating advertisement",
            error: error.message,
        })
    }
}

// Delete advertisement
export const deleteAdvertisement = async (req, res) => {
    try {
        const advertisement = await Advertisement.findById(req.params.id)

        if (!advertisement) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: "Advertisement not found",
            })
        }

        // Delete image from Cloudinary
        if (advertisement.image && advertisement.image.public_id) {
            await cloudinary.uploader.destroy(advertisement.image.public_id)
        }

        await Advertisement.findByIdAndDelete(req.params.id)

        res.status(StatusCodes.OK).json({
            success: true,
            message: "Advertisement deleted successfully",
        })
    } catch (error) {
        console.error("Error deleting advertisement:", error)
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Error deleting advertisement",
            error: error.message,
        })
    }
}

// Get advertisements for specific page and category
export const getAdvertisementsForPage = async (req, res) => {
    try {
        const { page, category } = req.query

        if (!page) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "Page parameter is required",
            })
        }

        const currentDate = new Date()

        // Build query
        const query = {
            isActive: true,
            targetPages: page,
            $or: [{ endDate: { $exists: false } }, { endDate: null }, { endDate: { $gte: currentDate } }],
            startDate: { $lte: currentDate },
        }

        // Add category filter if provided
        if (category) {
            query.category = category
        }

        const advertisements = await Advertisement.find(query).sort({ priority: -1, createdAt: -1 }).limit(10)

        res.status(StatusCodes.OK).json({
            success: true,
            count: advertisements.length,
            advertisements,
        })
    } catch (error) {
        console.error("Error fetching advertisements for page:", error)
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Error fetching advertisements",
            error: error.message,
        })
    }
}

// Track ad click
export const trackAdClick = async (req, res) => {
    try {
        const { id } = req.params

        const advertisement = await Advertisement.findById(id)

        if (!advertisement) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: "Advertisement not found",
            })
        }

        advertisement.clicks += 1
        await advertisement.save()

        res.status(StatusCodes.OK).json({
            success: true,
            message: "Click tracked successfully",
        })
    } catch (error) {
        console.error("Error tracking ad click:", error)
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Error tracking ad click",
            error: error.message,
        })
    }
}

// Track ad impression
export const trackAdImpression = async (req, res) => {
    try {
        const { id } = req.params

        const advertisement = await Advertisement.findById(id)

        if (!advertisement) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: "Advertisement not found",
            })
        }

        advertisement.impressions += 1
        await advertisement.save()

        res.status(StatusCodes.OK).json({
            success: true,
            message: "Impression tracked successfully",
        })
    } catch (error) {
        console.error("Error tracking ad impression:", error)
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Error tracking ad impression",
            error: error.message,
        })
    }
}
