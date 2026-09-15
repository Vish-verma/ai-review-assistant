// src/app.js
import express from "express";
import reviewRoutes from "./routes/review.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(express.json({ limit: "1mb" }));
app.get("/health", (req, res) => res.json({ status: "ok" }));
app.use("/api", reviewRoutes);
app.use(errorHandler);   // must be last

export default app;
