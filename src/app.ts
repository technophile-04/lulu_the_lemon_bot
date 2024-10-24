import express from "express";
import dotenv from "dotenv";
import { getMegaZuEvents } from "./services/lemonade.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const asyncHandler = (fn: any) => (req: any, res: any, next: any) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

app.get(
  "/hosting-events",
  asyncHandler(async (req: any, res: any) => {
    try {
      const events = await getMegaZuEvents();
      res.json(events);
    } catch (error: any) {
      console.error("Error fetching events:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to fetch events",
      });
    }
  }),
);

app.use((err: any, req: any, res: any, next: any) => {
  console.error("Global error:", err);
  res.status(500).json({
    success: false,
    error: err.message || "Internal server error",
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  console.log(`Try: http://localhost:${port}/hosting-events?limit=5&skip=0`);
});
