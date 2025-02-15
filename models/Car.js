// models/Car.js
import mongoose from "mongoose";

const carSchema = new mongoose.Schema({
    make: {
        type: String,
        required: true
    },
    model: {
        type: String,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    images: [{ type: String, required: true }], // Array of image URLs
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }, // Track who created the car
});

export default mongoose.model("Car", carSchema);