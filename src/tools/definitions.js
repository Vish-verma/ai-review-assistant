export const toolDeclarations = [
  {
    name: "listFiles",
    description:
      "Lists every file available for review. Call this FIRST if the user " +
      "mentions a file you have not seen, to get exact paths. Never guess a path.",
    parameters: { type: "OBJECT", properties: {} },
  },
  {
    name: "getFileContents",
    description:
      "Returns the full text of one file, with each line prefixed by its " +
      "1-based line number. You MUST use these prefixed numbers when citing " +
      "a line. Never compute a line number yourself.",
    parameters: {
      type: "OBJECT",
      properties: {
        path: { type: "STRING", description: "Exact path from listFiles" },
      },
      required: ["path"],
    },
  },
  {
    name: "searchCode",
    description:
      "Case-insensitive plain-text search across all files. Returns matching " +
      "lines with file path and line number. Use for locating a symbol before " +
      "reading a whole file.",
    parameters: {
      type: "OBJECT",
      properties: { query: { type: "STRING" } },
      required: ["query"],
    },
  },
  {
    name: "formatDuration",
    description:
      "Converts a duration in SECONDS to human-readable text. All durations in " +
      "this system are seconds, never milliseconds. You MUST call this instead " +
      "of calculating durations yourself.",
    parameters: {
      type: "OBJECT",
      properties: { seconds: { type: "NUMBER" } },
      required: ["seconds"],
    },
  },
];