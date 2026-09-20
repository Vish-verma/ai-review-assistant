import { complete } from "../llm/client.js";
import { parseStructured } from "../llm/parse.js";
import { z } from "zod";

const JUDGE_SYSTEM = `
You verify code review findings. For each finding, decide whether it is
supported by the code provided.

Keep a finding only if:
- The described problem is actually visible in the code
- The line number matches what the finding describes
- It is actionable, not a vague style preference

Discard anything you cannot verify against the code. Being strict is correct;
a wrong finding costs more trust than a missed one.
`.trim();

const JUDGE_SCHEMA = {
  type: "OBJECT",
  properties: {
    kept: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          index: { type: "INTEGER", description: "Index in the original findings array" },
          reason: { type: "STRING" },
        },
        required: ["index", "reason"],
      },
    },
  },
  required: ["kept"],
};

const judgeResult = z.object({
  kept: z.array(z.object({ index: z.number().int(), reason: z.string() })),
});

export async function judgeFindings({ code, findings }) {
  if (!findings.length) return { findings, dropped: 0 };

  const numbered = code.split("\n").map((l, i) => `${i + 1}: ${l}`).join("\n");

  const user = [
    "CODE:", numbered, "",
    "FINDINGS:",
    ...findings.map((f, i) => `[${i}] line ${f.line} (${f.severity}): ${f.message}`),
  ].join("\n");

  const { text } = await complete({
    system: JUDGE_SYSTEM,
    user,
    responseSchema: JUDGE_SCHEMA,
  });

  const { kept } = parseStructured(text, judgeResult);
  const keptIdx = new Set(kept.map((k) => k.index));

  return {
    findings: findings.filter((_, i) => keptIdx.has(i)),
    dropped: findings.length - keptIdx.size,
  };
}