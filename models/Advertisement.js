import mongoose from "mongoose"

const advertisementSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            required: true,
            enum: ["banner", "sidebar", "popup", "inline"],
            default: "banner",
        },
        category: {
            type: String,
            required: true,
            enum: ["cars", "accessories", "car-hire", "general"],
            default: "general",
        },
        targetPages: {
            type: [String],
            default: ["home"],
            // Possible values: home, cars, accessories, car-hire, details, etc.
        },
        image: {
            public_id: {
                type: String,
                required: true,
            },
            secure_url: {
                type: String,
                required: true,
            },
        },
        link: {
            type: String,
            required: false,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        priority: {
            type: Number,
            default: 0,
            // Higher number means higher priority
        },
        startDate: {
            type: Date,
            default: Date.now,
        },
        endDate: {
            type: Date,
            // Optional end date
        },
        clicks: {
            type: Number,
            default: 0,
        },
        impressions: {
            type: Number,
            default: 0,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true },
)

// Add index for efficient querying
advertisementSchema.index({ category: 1, isActive: 1, type: 1 })

export default mongoose.models.Advertisement || mongoose.model("Advertisement", advertisementSchema)
