import { z } from "zod";

export const findingSchema = z.object({
  line: z.number().int().min(1),
  severity: z.enum(["low", "medium", "high", "critical"]),
  category: z.enum(["security", "performance", "maintainability"]),
  message: z.string().min(1),
  confidence: z.number().min(0).max(1),
});

export const reviewResultSchema = z.object({
  findings: z.array(findingSchema),
  summary: z.string(),
});

/** Strip the junk models wrap JSON in. */
export function repairJson(text) {
  let t = text.trim();
  t = t.replace(/^```(?:json)?\s*/i, "").replace(/```$/, "");   // fences
  const first = t.search(/[[{]/);
  const last = Math.max(t.lastIndexOf("}"), t.lastIndexOf("]"));
  if (first > 0 || last < t.length - 1) t = t.slice(first, last + 1);  // prose around it
  t = t.replace(/[\u201C\u201D]/g, '"').replace(/[\u2018\u2019]/g, "'"); // smart quotes
  t = t.replace(/,(\s*[}\]])/g, "$1");                                   // trailing commas
  return t.trim();
}

export function parseStructured(text, schema) {
  let obj;
  try {
    obj = JSON.parse(text);
  } catch {
    obj = JSON.parse(repairJson(text));   // throws if still broken — caller retries
  }
  return schema.parse(obj);               // throws ZodError if shape is wrong
}