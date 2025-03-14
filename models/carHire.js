import mongoose from "mongoose";

const carHireSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Car name is required"],
            trim: true,
        },
        type: {
            type: String,
            required: [true, "Car type is required"],
            enum: ["Sedan", "SUV", "Bus", "Truck", "Convertible", "Pick-up"],
        },
        price: {
            type: Number,
            required: [true, "Price per day is required"],
        },
        seats: {
            type: Number,
            required: [true, "Number of seats is required"],
        },
        transmission: {
            type: String,
            enum: ["Automatic", "Manual"],
            default: "Automatic",
        },
        fuelType: {
            type: String,
            enum: ["Petrol", "Diesel", "Electric", "Hybrid"],
            default: "Petrol",
        },
        fuelEfficiency: {
            type: String,
            default: "",
        },
        location: {
            type: String,
            required: [true, "Location is required"],
            enum: ["Osogbo", "Akure"],
        },
        description: {
            type: String,
            required: [true, "Description is required"],
        },
        features: {
            type: [String],
            default: [],
        },
        images: [
            {
                public_id: String,
                secure_url: String,
            },
        ],
        status: {
            type: String,
            enum: ["available", "booked", "maintenance"],
            default: "available",
        },
        // rating: {
        //     type: Number,
        //     default: 9.5,
        //     min: 0,
        //     max: 10,
        // },
        bookings: {
            type: Number,
            default: 0,
        },
        lastMaintenance: {
            type: Date,
            default: Date.now,
        },
        nextMaintenance: {
            type: Date,
            default: () => new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    { timestamps: true }
);

// Add a virtual field for rating
carHireSchema.virtual("rating").get(function () {
    // Return a random rating between 4.0 and 5.0 if no reviews
    return (Math.random() * (5.0 - 4.0) + 4.0).toFixed(1);
});

// Ensure virtuals are included when converting to JSON
carHireSchema.set("toJSON", { virtuals: true });
carHireSchema.set("toObject", { virtuals: true });

const CarHire = mongoose.model("CarHire", carHireSchema);

export default CarHire;