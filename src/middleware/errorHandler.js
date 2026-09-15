import { env } from "../config/env.js";

export function errorHandler(err, req, res, next) {
  console.error("[error]", err.message);

  const status = err.status || 500;

  res.status(status).json({
    error: err.name || "InternalServerError",
    message:
      status === 500 && env.NODE_ENV === "production"
        ? "Something went wrong"
        : err.message,
  });
}