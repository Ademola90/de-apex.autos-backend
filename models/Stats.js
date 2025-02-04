// models/Stats.js

import mongoose from "mongoose";

const statsSchema = new mongoose.Schema(
    {
        date: { type: Date, required: true, default: Date.now }, // Date of the stats
        activeUsers: { type: Number, required: true }, // Number of active users
        totalUsers: { type: Number, required: true }, // Total users
    },
    { timestamps: true }
);

const Stats = mongoose.model("Stats", statsSchema);
export default Stats;
