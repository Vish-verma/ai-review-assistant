import fs from "node:fs/promises";
import path from "node:path";

const FIXTURES = path.resolve("fixtures");

async function resolveSafe(relPath) {
  const full = path.resolve(FIXTURES, relPath);
  if (!full.startsWith(FIXTURES)) {
    throw new Error("Path outside allowed directory");   // ← path traversal guard
  }
  return full;
}

export const toolImplementations = {
  async listFiles() {
    return { files: await fs.readdir(FIXTURES) };
  },

  async getFileContents({ path: p }) {
    const full = await resolveSafe(p);
    const raw = await fs.readFile(full, "utf8");
    const numbered = raw
      .split("\n")
      .map((line, i) => `${i + 1}: ${line}`)
      .join("\n");
    return { path: p, contents: numbered };
  },

  async searchCode({ query }) {
    const files = await fs.readdir(FIXTURES);
    const matches = [];
    for (const f of files) {
      const raw = await fs.readFile(path.join(FIXTURES, f), "utf8");
      raw.split("\n").forEach((line, i) => {
        if (line.toLowerCase().includes(query.toLowerCase())) {
          matches.push({ file: f, line: i + 1, text: line.trim() });
        }
      });
    }
    return { matches: matches.slice(0, 40) };
  },

  async formatDuration({ seconds }) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const parts = [];
    if (h) parts.push(`${h}h`);
    if (m) parts.push(`${m}m`);
    if (s || !parts.length) parts.push(`${s}s`);
    return { formatted: parts.join(" ") };
  },
};