import { z } from "zod";
import { reviewCode } from "../services/review.service.js";

const reviewSchema = z.object({
  code: z.string().min(1, "code is required").max(20_000, "code too large"),
  language: z.string().min(1).default("javascript"),
  focus: z.array(z.enum(["security", "performance", "maintainability"])).optional(),
});

export async function postReview(req, res, next) {
  try {
    const parsed = reviewSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: "ValidationError",
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const result = await reviewCode(parsed.data);
    res.json(result);
  } catch (err) {
    next(err);   // hand off to the error middleware
  }
}