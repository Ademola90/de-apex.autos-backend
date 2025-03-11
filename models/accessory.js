//model/accessoryries.js

import mongoose from "mongoose";

const accessorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    make: {
        type: String,
        required: true,
    },
    images: [
        {
            public_id: {
                type: String,
                required: true,
            },
            secure_url: {
                type: String,
                required: true,
            },
        },
    ],
    stock: {
        type: Number,
        required: true,
        default: 0,
    },
    sold: {
        type: Number,
        default: 0,
    },
    status: {
        type: String,
        enum: ["In Stock", "Low Stock", "Out of Stock"],
        default: "In Stock",
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
});

export default mongoose.model("Accessory", accessorySchema);


// import mongoose from "mongoose";

// const accessorySchema = new mongoose.Schema({
//     name: {
//         type: String,
//         required: true
//     },
//     description: {
//         type: String,
//         required: true
//     },
//     price: {
//         type: Number,
//         required: true
//     },
//     category: {
//         type: String,
//         required: true
//     },
//     make: {
//         type: String,
//         required: true
//     },
//     images: [{ type: String, required: true }], // Array of image URLs
//     stock: {
//         type: Number,
//         required: true,
//         default: 0
//     },
//     status: {
//         type: String,
//         enum: ["In Stock", "Low Stock", "Out of Stock"],
//         default: "In Stock"
//     },
//     createdBy: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "User",
//         required: true
//     },
// });

// export default mongoose.model("Accessory", accessorySchema);