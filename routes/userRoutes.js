// routes/userRoutes.js
import express from "express";
import { getUsersByTimeframe, getUserStats, getUserAnalytics } from "../controllers/userStatsController.js";

const router = express.Router();

router.get("/stats", getUserStats);
router.get("/timeframe-users", getUsersByTimeframe);
router.get("/analytics", getUserAnalytics);

export default router;  