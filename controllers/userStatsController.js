// controllers/userStatsController.js

import User from "../models/User.js";
import moment from "moment"; // for date manipulation


// Function to fetch user analytics
export const getUserAnalytics = async (req, res) => {
    try {
        // Define time ranges
        const todayStart = moment().startOf("day").toDate();
        const todayEnd = moment().endOf("day").toDate();
        const weekStart = moment().startOf("week").toDate();
        const weekEnd = moment().endOf("week").toDate();
        const monthStart = moment().startOf("month").toDate();
        const monthEnd = moment().endOf("month").toDate();
        const activeSince = moment().subtract(30, "days").toDate();

        // Perform database queries
        const totalUsers = await User.countDocuments();
        const dailyUsers = await User.countDocuments({
            createdAt: { $gte: todayStart, $lte: todayEnd },
        });
        const weeklyUsers = await User.countDocuments({
            createdAt: { $gte: weekStart, $lte: weekEnd },
        });
        const monthlyUsers = await User.countDocuments({
            createdAt: { $gte: monthStart, $lte: monthEnd },
        });
        const activeUsers = await User.countDocuments({
            lastLogin: { $gte: activeSince },
        });

        // Combine all analytics into one response
        return res.status(200).json({
            totalUsers,
            dailyUsers,
            weeklyUsers,
            monthlyUsers,
            activeUsers,
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

export const getUserStats = async (req, res) => {
    try {
        // Define the time range for active users (e.g., past 30 days)
        const activeSince = moment().subtract(30, "days").toDate();

        // Count the total number of users
        const totalUsers = await User.countDocuments();

        // Count the number of active users (logged in within the past 30 days)
        const activeUsers = await User.countDocuments({ lastLogin: { $gte: activeSince } });

        return res.status(200).json({
            totalUsers,
            activeUsers,
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};


export const getUsersByTimeframe = async (req, res) => {
    try {
        // Define the start and end dates for each timeframe
        const todayStart = moment().startOf("day").toDate(); // Start of today
        const todayEnd = moment().endOf("day").toDate(); // End of today

        const weekStart = moment().startOf("week").toDate(); // Start of the week
        const weekEnd = moment().endOf("week").toDate(); // End of the week

        const monthStart = moment().startOf("month").toDate(); // Start of the month
        const monthEnd = moment().endOf("month").toDate(); // End of the month

        // Query the database for user counts
        const dailyUsers = await User.countDocuments({
            createdAt: { $gte: todayStart, $lte: todayEnd },
        });

        const weeklyUsers = await User.countDocuments({
            createdAt: { $gte: weekStart, $lte: weekEnd },
        });

        const monthlyUsers = await User.countDocuments({
            createdAt: { $gte: monthStart, $lte: monthEnd },
        });

        return res.status(200).json({
            dailyUsers,
            weeklyUsers,
            monthlyUsers,
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};