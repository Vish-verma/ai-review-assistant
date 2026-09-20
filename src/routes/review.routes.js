import { Router } from "express";
import { postReview, postAsk } from "../controllers/review.controller.js";

const router = Router();
router.post("/review", postReview);
router.post("/ask", postAsk);

export default router;