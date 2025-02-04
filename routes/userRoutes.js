// routes/userRoutes.js
import express from "express";
import { getUsersByTimeframe, getUserStats } from "../controllers/userStatsController.js";

const router = express.Router();

router.get("/stats", getUserStats);
router.get("/timeframe-users", getUsersByTimeframe);

export default router; 