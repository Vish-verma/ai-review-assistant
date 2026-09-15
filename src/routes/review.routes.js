import { Router } from "express";
import { postReview } from "../controllers/review.controller.js";

const router = Router();
router.post("/review", postReview);

export default router;