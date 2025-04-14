import mongoose from "mongoose";

const CarHireBookingSchema = new mongoose.Schema(
    {
        car: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CarHire",
            required: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        bookingId: {
            type: String,
            required: true,
            unique: true,
        },
        pickupLocation: {
            state: {
                type: String,
                required: true,
            },
            city: {
                type: String,
                required: true,
            },
            address: {
                type: String,
                required: true,
            }
        },
        dropoffLocation: {
            state: {
                type: String,
                required: true,
            },
            city: {
                type: String,
                required: true,
            },
            address: {
                type: String,
                required: true,
            }
        },
        pickupDate: {
            type: Date,
            required: true,
        },
        pickupTime: {
            type: String,
            required: true,
        },
        returnDate: {
            type: Date,
            required: true,
        },
        returnTime: {
            type: String,
            required: true,
        },
        totalDays: {
            type: Number,
            required: true,
            min: 1,
        },
        driverOption: {
            type: String,
            enum: ["self", "chauffeur"],
            default: "self",
        },
        journeyType: {
            type: String,
            enum: ["one-way", "round-trip"],
            default: "one-way",
        },
        distance: {
            type: Number, // in kilometers
            required: true,
        },
        duration: {
            type: String, // formatted duration (e.g., "2 hours 30 mins")
            required: true,
        },
        pricePerKm: {
            type: Number,
            default: 10000, // ₦10,000 per km
        },
        distancePrice: {
            type: Number,
            required: true,
        },
        chauffeurFee: {
            type: Number,
            default: 0,
        },
        basePrice: {
            type: Number,
            required: true,
        },
        totalPrice: {
            type: Number,
            required: true,
        },
        paymentStatus: {
            type: String,
            enum: ["pending", "paid", "failed", "refunded"],
            default: "pending",
        },
        paymentMethod: {
            type: String,
            enum: ["card", "bank_transfer", "cash"],
            default: "card",
        },
        paymentReference: {
            type: String,
        },
        status: {
            type: String,
            enum: ["pending", "confirmed", "cancelled", "completed"],
            default: "pending",
        },
        customerDetails: {
            fullName: {
                type: String,
                required: true,
            },
            email: {
                type: String,
                required: true,
            },
            phone: {
                type: String,
                required: true,
            },
            address: {
                type: String,
                required: true,
            },
            city: {
                type: String,
                required: true,
            },
            state: {
                type: String,
                required: true,
            },
        },
    },
    { timestamps: true }
);

// Generate a unique booking ID before saving
CarHireBookingSchema.pre("save", async function (next) {
    if (!this.isNew) {
        return next();
    }

    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");

    this.bookingId = `BK${year}${month}${day}${random}`;
    next();
});

export default mongoose.model("CarHireBooking", CarHireBookingSchema);