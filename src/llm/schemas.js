export const REVIEW_SCHEMA = {
  type: "OBJECT",
  properties: {
    findings: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          line: { type: "INTEGER", description: "1-based line number in the provided code" },
          severity: { type: "STRING", enum: ["low", "medium", "high", "critical"] },
          category: { type: "STRING", enum: ["security", "performance", "maintainability"] },
          message: { type: "STRING", description: "Two sentences maximum" },
          confidence: { type: "NUMBER", description: "0 to 1" },
        },
        required: ["line", "severity", "category", "message", "confidence"],
      },
    },
    summary: { type: "STRING" },
  },
  required: ["findings", "summary"],
};